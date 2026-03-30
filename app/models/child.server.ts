import prisma from '~/lib/prisma';

export function createChild({
    name,
    birthday,
    sizingJson,
    allergies,
    interests,
    pediatrician,
    notes,
    userId,
}: {
    name: string;
    birthday?: Date | null;
    sizingJson?: unknown;
    allergies?: string | null;
    interests?: string | null;
    pediatrician?: string | null;
    notes?: string | null;
    userId: string;
}) {
    return prisma.child.create({
        data: {
            name,
            birthday,
            sizingJson: sizingJson ?? undefined,
            allergies,
            interests,
            pediatrician,
            notes,
            userId,
        },
    });
}

export function getChildrenByUserId(userId: string) {
    return prisma.child.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export function getChildById(id: string, userId: string) {
    return prisma.child.findFirst({
        where: { id, userId },
    });
}

export function updateChild(
    id: string,
    userId: string,
    data: {
        name?: string;
        birthday?: Date | null;
        sizingJson?: unknown;
        allergies?: string | null;
        interests?: string | null;
        pediatrician?: string | null;
        notes?: string | null;
    },
) {
    return prisma.child.update({
        where: { id, userId },
        data: {
            ...data,
            sizingJson: data.sizingJson ?? undefined,
        },
    });
}

export function deleteChild(id: string, userId: string) {
    return prisma.child.delete({
        where: { id, userId },
    });
}
