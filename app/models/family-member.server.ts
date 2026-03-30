import prisma from '~/lib/prisma';

export function createFamilyMember({
    name,
    relationship,
    notes,
    userId,
}: {
    name: string;
    relationship: string;
    notes?: string | null;
    userId: string;
}) {
    return prisma.familyMember.create({
        data: { name, relationship, notes, userId },
    });
}

export function getFamilyMembersByUserId(userId: string) {
    return prisma.familyMember.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
    });
}

export function updateFamilyMember(
    id: string,
    userId: string,
    data: {
        name?: string;
        relationship?: string;
        notes?: string | null;
    },
) {
    return prisma.familyMember.update({
        where: { id, userId },
        data,
    });
}

export function deleteFamilyMember(id: string, userId: string) {
    return prisma.familyMember.delete({
        where: { id, userId },
    });
}
