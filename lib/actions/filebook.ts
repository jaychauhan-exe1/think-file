"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createFilebook(name: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const filebook = await prisma.filebook.create({
        data: {
            name,
            userId: session.user.id,
        }
    });

    revalidatePath("/my-files");
    return filebook;
}

export async function getFilebooks() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        return [];
    }

    return await prisma.filebook.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            _count: {
                select: { documents: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}
