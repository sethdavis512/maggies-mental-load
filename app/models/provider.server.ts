import prisma from '~/lib/prisma';

export function createProvider({
    name,
    category,
    phone,
    email,
    notes,
    cost,
    frequency,
    userId,
}: {
    name: string;
    category: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    cost?: string | null;
    frequency?: string | null;
    userId: string;
}) {
    return prisma.provider.create({
        data: {
            name,
            category,
            phone,
            email,
            notes,
            cost,
            frequency,
            userId,
        },
    });
}

export function getProvidersByUserId(userId: string) {
    return prisma.provider.findMany({
        where: { userId },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
}

export function getProvidersByCategory(userId: string, category: string) {
    return prisma.provider.findMany({
        where: { userId, category },
        orderBy: { name: 'asc' },
    });
}

export function updateProvider(
    id: string,
    userId: string,
    data: {
        name?: string;
        category?: string;
        phone?: string | null;
        email?: string | null;
        notes?: string | null;
        cost?: string | null;
        frequency?: string | null;
    },
) {
    return prisma.provider.update({
        where: { id, userId },
        data,
    });
}

export function deleteProvider(id: string, userId: string) {
    return prisma.provider.delete({
        where: { id, userId },
    });
}

export function searchProviders(userId: string, query: string) {
    return prisma.provider.findMany({
        where: {
            userId,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
            ],
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
}
