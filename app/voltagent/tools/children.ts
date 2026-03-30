import { createTool } from '@voltagent/core';
import invariant from 'tiny-invariant';
import z from 'zod';
import { rateLimit } from '~/lib/rate-limit.server';
import {
    createChild,
    getChildrenByUserId,
    updateChild,
} from '~/models/child.server';
import prisma from '~/lib/prisma';

export const upsertChildProfileTool = createTool({
    name: 'upsert_child_profile',
    description:
        "Save or update a child's profile. Use when the user mentions a child's name, age, birthday, allergy, sizing, interests, or pediatrician.",
    parameters: z.object({
        name: z
            .string()
            .max(100, 'Name must be 100 characters or fewer')
            .describe("The child's name"),
        birthday: z
            .string()
            .optional()
            .describe("The child's birthday as an ISO date string (e.g. 2023-06-15)"),
        sizing: z
            .string()
            .optional()
            .describe("The child's current clothing/shoe sizes"),
        allergies: z
            .string()
            .optional()
            .describe('Known allergies'),
        interests: z
            .string()
            .optional()
            .describe("The child's interests and favorite things"),
        pediatrician: z
            .string()
            .optional()
            .describe("The child's pediatrician name or practice"),
        notes: z
            .string()
            .optional()
            .describe('Any other notes about this child'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const { success } = rateLimit({
            key: `child-upsert:${userId}`,
            maxRequests: 10,
            windowMs: 3_600_000,
        });

        if (!success) {
            return { error: 'Rate limit exceeded. Try again later.' };
        }

        const existing = await prisma.child.findFirst({
            where: { userId, name: args.name },
        });

        const data = {
            name: args.name,
            birthday: args.birthday ? new Date(args.birthday) : undefined,
            sizingJson: args.sizing ?? undefined,
            allergies: args.allergies,
            interests: args.interests,
            pediatrician: args.pediatrician,
            notes: args.notes,
        };

        const child = existing
            ? await updateChild(existing.id, userId, data)
            : await createChild({ ...data, userId });

        return {
            id: child.id,
            name: child.name,
            birthday: child.birthday,
            allergies: child.allergies,
            interests: child.interests,
            pediatrician: child.pediatrician,
            updated: !!existing,
        };
    },
});

export const getChildProfilesTool = createTool({
    name: 'get_child_profiles',
    description:
        "Get all child profiles for the current user. Use when the user asks about their children's information.",
    parameters: z.object({}),
    execute: async (_args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const children = await getChildrenByUserId(userId);

        return {
            children: children.map((c) => ({
                id: c.id,
                name: c.name,
                birthday: c.birthday,
                allergies: c.allergies,
                interests: c.interests,
                pediatrician: c.pediatrician,
            })),
        };
    },
});
