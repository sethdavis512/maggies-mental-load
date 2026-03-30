import { createTool } from '@voltagent/core';
import invariant from 'tiny-invariant';
import z from 'zod';
import { rateLimit } from '~/lib/rate-limit.server';
import {
    createProvider,
    getProvidersByUserId,
    getProvidersByCategory,
    searchProviders,
    updateProvider,
} from '~/models/provider.server';
import prisma from '~/lib/prisma';

const providerCategories = [
    'cleaner',
    'pest_control',
    'lawn',
    'babysitter',
    'handyman',
    'hvac',
    'plumber',
    'electrician',
    'pet_services',
    'pediatrician',
    'specialist',
    'other',
] as const;

export const upsertProviderTool = createTool({
    name: 'upsert_provider',
    description:
        'Save or update a service provider/vendor. Use when the user mentions a cleaner, babysitter, handyman, doctor, or any service provider.',
    parameters: z.object({
        name: z
            .string()
            .max(200, 'Name must be 200 characters or fewer')
            .describe('The provider or vendor name'),
        category: z
            .enum(providerCategories)
            .describe('The type of service this provider offers'),
        phone: z
            .string()
            .optional()
            .describe('Phone number'),
        email: z
            .string()
            .optional()
            .describe('Email address'),
        notes: z
            .string()
            .optional()
            .describe('Any notes about this provider'),
        cost: z
            .string()
            .optional()
            .describe('Cost or pricing info (e.g. "$150/visit")'),
        frequency: z
            .string()
            .optional()
            .describe('How often they come (e.g. "weekly", "as needed")'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const { success } = rateLimit({
            key: `provider-upsert:${userId}`,
            maxRequests: 10,
            windowMs: 3_600_000,
        });

        if (!success) {
            return { error: 'Rate limit exceeded. Try again later.' };
        }

        const existing = await prisma.provider.findFirst({
            where: { userId, name: args.name, category: args.category },
        });

        const data = {
            name: args.name,
            category: args.category,
            phone: args.phone,
            email: args.email,
            notes: args.notes,
            cost: args.cost,
            frequency: args.frequency,
        };

        const provider = existing
            ? await updateProvider(existing.id, userId, data)
            : await createProvider({ ...data, userId });

        return {
            id: provider.id,
            name: provider.name,
            category: provider.category,
            phone: provider.phone,
            email: provider.email,
            cost: provider.cost,
            frequency: provider.frequency,
            updated: !!existing,
        };
    },
});

export const getProvidersTool = createTool({
    name: 'get_providers',
    description:
        "Get all providers/vendors for the current user, optionally filtered by category. Use when the user asks about their service providers.",
    parameters: z.object({
        category: z
            .enum(providerCategories)
            .optional()
            .describe('Filter by category (omit to get all providers)'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const providers = args.category
            ? await getProvidersByCategory(userId, args.category)
            : await getProvidersByUserId(userId);

        return {
            providers: providers.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                phone: p.phone,
                email: p.email,
                notes: p.notes,
                cost: p.cost,
                frequency: p.frequency,
            })),
        };
    },
});

export const searchProvidersTool = createTool({
    name: 'search_providers',
    description:
        'Search providers by name or category. Use when the user asks to find a specific type of provider.',
    parameters: z.object({
        query: z
            .string()
            .describe('Search term to match against provider name or category'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const providers = await searchProviders(userId, args.query);

        return {
            providers: providers.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                phone: p.phone,
                email: p.email,
                notes: p.notes,
                cost: p.cost,
                frequency: p.frequency,
            })),
        };
    },
});
