import { createTool } from '@voltagent/core';
import invariant from 'tiny-invariant';
import z from 'zod';
import { rateLimit } from '~/lib/rate-limit.server';
import {
    setPreference,
    getPreferencesByUserId,
    getPreferencesByCategory,
} from '~/models/preference.server';

const PREFERENCE_CATEGORIES = [
    'dietary',
    'cleaning',
    'travel',
    'financial',
    'calendar',
    'grocery',
    'general',
] as const;

export const setPreferenceTool = createTool({
    name: 'set_preference',
    description:
        'Save or update a household preference. Use when the user states a preference such as a dietary restriction, preferred grocery store, cleaning schedule, or any other household preference.',
    parameters: z.object({
        key: z
            .string()
            .max(200, 'Key must be 200 characters or fewer')
            .describe(
                'A short, descriptive key for the preference (e.g. "preferred_grocery_store", "cleaning_day", "dairy_free")'
            ),
        value: z
            .string()
            .max(1000, 'Value must be 1000 characters or fewer')
            .describe(
                'The preference value (e.g. "HEB", "Saturdays", "yes")'
            ),
        category: z
            .enum(PREFERENCE_CATEGORIES)
            .describe('The category this preference belongs to'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const { success } = rateLimit({
            key: `preference-set:${userId}`,
            maxRequests: 20,
            windowMs: 3_600_000,
        });

        if (!success) {
            return { error: 'Rate limit exceeded. Try again later.' };
        }

        const preference = await setPreference({
            key: args.key,
            value: args.value,
            category: args.category,
            userId,
        });

        return {
            id: preference.id,
            key: preference.key,
            value: preference.value,
            category: preference.category,
        };
    },
});

export const getPreferencesTool = createTool({
    name: 'get_preferences',
    description:
        "Get household preferences for the current user. Optionally filter by category. Use when the user asks about their preferences or you need to check what's already stored.",
    parameters: z.object({
        category: z
            .enum(PREFERENCE_CATEGORIES)
            .optional()
            .describe('Optional category to filter by'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const preferences = args.category
            ? await getPreferencesByCategory(userId, args.category)
            : await getPreferencesByUserId(userId);

        return {
            preferences: preferences.map((p) => ({
                id: p.id,
                key: p.key,
                value: p.value,
                category: p.category,
            })),
        };
    },
});
