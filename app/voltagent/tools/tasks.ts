import { createTool } from '@voltagent/core';
import invariant from 'tiny-invariant';
import z from 'zod';
import type { Task } from '~/generated/prisma/browser';
import { rateLimit } from '~/lib/rate-limit.server';
import {
    createTask,
    getTasksByUserId,
    completeTask,
} from '~/models/task.server';

function serializeTask(t: Task) {
    return {
        id: t.id,
        title: t.title,
        category: t.category,
        urgency: t.urgency,
        deadline: t.deadline,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
    };
}

export const createTaskTool = createTool({
    name: 'create_task',
    description:
        'Add a task to the household running list. Use when the user mentions something that needs doing, a reminder, errand, or chore.',
    parameters: z.object({
        title: z
            .string()
            .max(300, 'Title must be 300 characters or fewer')
            .describe('What needs to be done'),
        category: z
            .enum(['meals', 'home', 'kids', 'scheduling', 'finance', 'mental'])
            .describe('Which area of household life this falls under'),
        urgency: z
            .enum(['red', 'yellow', 'green', 'none'])
            .optional()
            .describe(
                'How urgent: red = do today, yellow = this week, green = when you can, none = no rush',
            ),
        deadline: z
            .string()
            .optional()
            .describe('Optional due date in ISO 8601 format (e.g. 2026-03-28)'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const { success } = rateLimit({
            key: `task-create:${userId}`,
            maxRequests: 30,
            windowMs: 3_600_000,
        });

        if (!success) {
            return { error: 'Rate limit exceeded. Try again later.' };
        }

        const task = await createTask({
            title: args.title,
            category: args.category,
            urgency: args.urgency ?? 'none',
            deadline: args.deadline ? new Date(args.deadline) : null,
            userId,
        });

        return serializeTask(task);
    },
});

export const listTasksTool = createTool({
    name: 'list_tasks',
    description:
        "List the user's household tasks. Use when they ask what's on their list, want to plan their week, or need to see what's pending.",
    parameters: z.object({
        category: z
            .enum(['meals', 'home', 'kids', 'scheduling', 'finance', 'mental'])
            .optional()
            .describe('Filter to a specific category, or omit for all tasks'),
        includeCompleted: z
            .boolean()
            .optional()
            .describe('Whether to include completed tasks (default: false)'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const tasks = await getTasksByUserId(userId, {
            category: args.category,
            includeCompleted: args.includeCompleted ?? false,
        });

        return { tasks: tasks.map(serializeTask) };
    },
});

export const completeTaskTool = createTool({
    name: 'complete_task',
    description:
        'Mark a task as done. Use when the user confirms a task is finished. Always confirm with the user before completing.',
    parameters: z.object({
        taskId: z.string().describe('The ID of the task to mark as complete'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const task = await completeTask(args.taskId, userId);

        return serializeTask(task);
    },
});
