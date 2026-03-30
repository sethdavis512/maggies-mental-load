import prisma from '~/lib/prisma';

export function createLoyaltyProgram({
    programName,
    memberNumber,
    brand,
    notes,
    userId,
}: {
    programName: string;
    memberNumber?: string | null;
    brand?: string | null;
    notes?: string | null;
    userId: string;
}) {
    return prisma.loyaltyProgram.create({
        data: { programName, memberNumber, brand, notes, userId },
    });
}

export function getLoyaltyProgramsByUserId(userId: string) {
    return prisma.loyaltyProgram.findMany({
        where: { userId },
        orderBy: { programName: 'asc' },
    });
}

export function updateLoyaltyProgram(
    id: string,
    userId: string,
    data: {
        programName?: string;
        memberNumber?: string | null;
        brand?: string | null;
        notes?: string | null;
    },
) {
    return prisma.loyaltyProgram.update({
        where: { id, userId },
        data,
    });
}

export function deleteLoyaltyProgram(id: string, userId: string) {
    return prisma.loyaltyProgram.delete({
        where: { id, userId },
    });
}
