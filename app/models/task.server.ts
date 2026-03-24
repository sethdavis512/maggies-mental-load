import prisma from '~/lib/prisma';

const MAX_TITLE_LENGTH = 300;

export function createTask({
    title,
    category,
    urgency = 'none',
    deadline,
    userId,
}: {
    title: string;
    category: string;
    urgency?: string;
    deadline?: Date | null;
    userId: string;
}) {
    return prisma.task.create({
        data: {
            title: title.slice(0, MAX_TITLE_LENGTH),
            category,
            urgency,
            deadline,
            userId,
        },
    });
}

export function getTasksByUserId(
    userId: string,
    {
        category,
        includeCompleted = false,
    }: { category?: string; includeCompleted?: boolean } = {},
) {
    return prisma.task.findMany({
        where: {
            userId,
            ...(category ? { category } : {}),
            ...(!includeCompleted ? { completedAt: null } : {}),
        },
        orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });
}

export function getUpcomingTasks(userId: string, days = 7) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.task.findMany({
        where: {
            userId,
            completedAt: null,
            OR: [{ deadline: { lte: cutoff } }, { urgency: 'red' }],
        },
        orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });
}

export function completeTask(taskId: string, userId: string) {
    return prisma.task.update({
        where: { id: taskId, userId },
        data: { completedAt: new Date() },
    });
}

export function deleteTask(taskId: string, userId: string) {
    return prisma.task.delete({
        where: { id: taskId, userId },
    });
}
