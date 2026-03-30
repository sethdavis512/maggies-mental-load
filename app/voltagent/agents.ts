import { Agent, Memory } from '@voltagent/core';
import { PostgreSQLMemoryAdapter } from '@voltagent/postgres';
import { z } from 'zod';
import { createNoteTool, listNotesTool, searchNotesTool } from './tools/notes';
import { createTaskTool, listTasksTool, completeTaskTool } from './tools/tasks';
import { upsertChildProfileTool, getChildProfilesTool } from './tools/children';
import { upsertProviderTool, getProvidersTool, searchProvidersTool } from './tools/providers';
import { setPreferenceTool, getPreferencesTool } from './tools/preferences';
import { upsertFamilyMemberTool, upsertLoyaltyProgramTool } from './tools/family';
import { NotesRetriever } from './retrievers/notes';
import { TasksRetriever } from './retrievers/tasks';
import { HouseholdManualRetriever } from './retrievers/household-manual';
import { CombinedRetriever } from './retrievers/combined';
import { env } from '~/lib/env.server';
import {
    basePrompt,
    mealsPrompt,
    homePrompt,
    kidsPrompt,
    schedulingPrompt,
    financePrompt,
    seasonalPrompt,
    onboardingPrompt,
} from './prompts';

export const memory = new Memory({
    storage: new PostgreSQLMemoryAdapter({
        connection: env.VOLTAGENT_DATABASE_URL,
    }),
    workingMemory: {
        enabled: true,
        scope: 'user',
        schema: z.object({
            name: z.string().optional(),
            preferences: z.array(z.string()).optional(),
            topics: z.array(z.string()).optional(),
            privacyReminderGiven: z.boolean().optional(),
            proactiveFlagUsed: z.boolean().optional(),
            currentMode: z
                .enum(['normal', 'chaos', 'braindump'])
                .optional(),
        }),
    },
});

const retriever = new CombinedRetriever([
    new NotesRetriever(),
    new TasksRetriever(),
    new HouseholdManualRetriever(),
]);

export const agent = new Agent({
    name: 'Maggie',
    instructions: [
        basePrompt,
        mealsPrompt,
        homePrompt,
        kidsPrompt,
        schedulingPrompt,
        financePrompt,
        seasonalPrompt,
        onboardingPrompt,
    ].join('\n\n---\n\n'),
    model: 'anthropic/claude-3-haiku-20240307',
    tools: [
        createNoteTool,
        listNotesTool,
        searchNotesTool,
        createTaskTool,
        listTasksTool,
        completeTaskTool,
        upsertChildProfileTool,
        getChildProfilesTool,
        upsertProviderTool,
        getProvidersTool,
        searchProvidersTool,
        setPreferenceTool,
        getPreferencesTool,
        upsertFamilyMemberTool,
        upsertLoyaltyProgramTool,
    ],
    retriever,
    memory,
});
