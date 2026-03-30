import prisma from '~/lib/prisma';

export function setPreference({
    key,
    value,
    category,
    userId,
}: {
    key: string;
    value: string;
    category: string;
    userId: string;
}) {
    return prisma.householdPreference.upsert({
        where: { userId_key: { userId, key } },
        create: { key, value, category, userId },
        update: { value, category },
    });
}

export function getPreferencesByUserId(userId: string) {
    return prisma.householdPreference.findMany({
        where: { userId },
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
}

export function getPreferencesByCategory(userId: string, category: string) {
    return prisma.householdPreference.findMany({
        where: { userId, category },
        orderBy: { key: 'asc' },
    });
}

export function getPreference(userId: string, key: string) {
    return prisma.householdPreference.findUnique({
        where: { userId_key: { userId, key } },
    });
}

export function deletePreference(id: string, userId: string) {
    return prisma.householdPreference.delete({
        where: { id, userId },
    });
}
