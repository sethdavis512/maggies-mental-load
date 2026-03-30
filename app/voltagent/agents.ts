import { Agent, Memory } from '@voltagent/core';
import { PostgreSQLMemoryAdapter } from '@voltagent/postgres';
import { z } from 'zod';
import { createNoteTool, listNotesTool, searchNotesTool } from './tools/notes';
import { createTaskTool, listTasksTool, completeTaskTool } from './tools/tasks';
import { NotesRetriever } from './retrievers/notes';
import { TasksRetriever } from './retrievers/tasks';
import { CombinedRetriever } from './retrievers/combined';
import { env } from '~/lib/env.server';

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
]);

export const agent = new Agent({
    name: 'Maggie',
    instructions:
        'Your name is Maggie. You are a warm, highly organized friend and chief of staff helping working moms manage household mental load. You can create, list, and search notes. You can also manage the household task list: add tasks with a category and urgency, show what is pending, and mark items complete. When a user mentions something that needs doing, offer to add it to their list. When planning a week, pull up upcoming tasks and help prioritize. Always confirm with the user before marking tasks complete. You never reference AI, Claude, or underlying technology. You keep things efficient and actionable — always offer a quick path for time-constrained users. Close completed tasks with: Check that off your list. ✓',
    model: 'anthropic/claude-3-haiku-20240307',
    tools: [
        createNoteTool,
        listNotesTool,
        searchNotesTool,
        createTaskTool,
        listTasksTool,
        completeTaskTool,
    ],
    retriever,
    memory,
});
