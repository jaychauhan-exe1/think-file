"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkFilebookLimit } from "./usage";

export async function createFilebook(name: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const { allowed, error } = await checkFilebookLimit();
    if (!allowed) {
        throw new Error(error);
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

export async function getFilebookById(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const filebook = await prisma.filebook.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            documents: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            _count: {
                select: { documents: true }
            }
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found");
    }

    return filebook;
}

export async function deleteFilebook(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Verify ownership before deleting
    const filebook = await prisma.filebook.findFirst({
        where: {
            id,
            userId: session.user.id,
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found or unauthorized");
    }

    await prisma.filebook.delete({
        where: { id }
    });

    revalidatePath("/my-files");
    return { success: true };
}

export async function saveChatMessage(filebookId: string, role: "user" | "ai", content: string, model?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const filebook = await prisma.filebook.findFirst({
        where: {
            id: filebookId,
            userId: session.user.id,
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found or unauthorized");
    }

    const message = await prisma.chatMessage.create({
        data: {
            role,
            content,
            model,
            filebookId,
        }
    });

    return message;
}

export async function getChatMessages(filebookId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const filebook = await prisma.filebook.findFirst({
        where: {
            id: filebookId,
            userId: session.user.id,
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found or unauthorized");
    }

    return await prisma.chatMessage.findMany({
        where: {
            filebookId,
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}
