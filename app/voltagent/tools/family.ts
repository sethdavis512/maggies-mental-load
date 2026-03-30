import { createTool } from '@voltagent/core';
import invariant from 'tiny-invariant';
import z from 'zod';
import prisma from '~/lib/prisma';
import {
    createFamilyMember,
    updateFamilyMember,
} from '~/models/family-member.server';
import {
    createLoyaltyProgram,
    updateLoyaltyProgram,
} from '~/models/loyalty-program.server';

export const upsertFamilyMemberTool = createTool({
    name: 'upsert_family_member',
    description:
        'Save or update a family member. Use when the user mentions a spouse, partner, grandparent, aunt, uncle, or other family member by name and relationship.',
    parameters: z.object({
        name: z
            .string()
            .max(100, 'Name must be 100 characters or fewer')
            .describe("The family member's name"),
        relationship: z
            .string()
            .describe(
                'Relationship to the user (e.g. spouse, partner, grandmother, uncle)',
            ),
        notes: z
            .string()
            .optional()
            .describe('Any other notes about this family member'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const existing = await prisma.familyMember.findFirst({
            where: { userId, name: args.name },
        });

        const data = {
            name: args.name,
            relationship: args.relationship,
            notes: args.notes,
        };

        const member = existing
            ? await updateFamilyMember(existing.id, userId, data)
            : await createFamilyMember({ ...data, userId });

        return {
            id: member.id,
            name: member.name,
            relationship: member.relationship,
            updated: !!existing,
        };
    },
});

export const upsertLoyaltyProgramTool = createTool({
    name: 'upsert_loyalty_program',
    description:
        'Save or update a loyalty or rewards program. Use when the user mentions a rewards card, membership number, frequent flyer account, or loyalty program.',
    parameters: z.object({
        programName: z
            .string()
            .max(200, 'Program name must be 200 characters or fewer')
            .describe(
                'Name of the loyalty or rewards program (e.g. Target Circle, Southwest Rapid Rewards)',
            ),
        memberNumber: z
            .string()
            .optional()
            .describe('Membership or account number'),
        brand: z
            .string()
            .optional()
            .describe('Brand or company associated with the program'),
        notes: z
            .string()
            .optional()
            .describe('Any other notes about this program'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const existing = await prisma.loyaltyProgram.findFirst({
            where: { userId, programName: args.programName },
        });

        const data = {
            programName: args.programName,
            memberNumber: args.memberNumber,
            brand: args.brand,
            notes: args.notes,
        };

        const program = existing
            ? await updateLoyaltyProgram(existing.id, userId, data)
            : await createLoyaltyProgram({ ...data, userId });

        return {
            id: program.id,
            programName: program.programName,
            brand: program.brand,
            updated: !!existing,
        };
    },
});
