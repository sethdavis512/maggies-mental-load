import {
    BaseRetriever,
    type BaseMessage,
    type RetrieveOptions,
} from '@voltagent/core';
import { getUpcomingTasks } from '~/models/task.server';

export class TasksRetriever extends BaseRetriever {
    constructor() {
        super({
            toolName: 'upcoming_tasks_context',
            toolDescription:
                "Surface the user's upcoming and urgent tasks as context.",
        });
    }

    async retrieve(
        _input: string | BaseMessage[],
        options: RetrieveOptions,
    ): Promise<string> {
        const { userId } = options;
        if (!userId) return '';

        const tasks = await getUpcomingTasks(userId);
        if (!tasks.length) return '';

        const lines = tasks.map((t) => {
            const parts = [`- ${t.title} [${t.category}]`];
            if (t.urgency !== 'none') parts.push(`(${t.urgency})`);
            if (t.deadline) {
                parts.push(`due ${t.deadline.toISOString().split('T')[0]}`);
            }
            return parts.join(' ');
        });

        return `## Upcoming tasks (next 7 days + urgent)\n${lines.join('\n')}`;
    }
}
