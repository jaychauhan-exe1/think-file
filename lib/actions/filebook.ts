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

    // Use Raw SQL to ensure isFeatured column is fetched
    const results = await prisma.$queryRawUnsafe(`
        SELECT f.*, 
               (SELECT COUNT(*)::int FROM "document" d WHERE d."filebookId" = f.id) as "docCount"
        FROM "filebook" f
        WHERE f.id = $1
    `, id) as any[];

    if (!results || results.length === 0) {
        throw new Error("Filebook not found");
    }

    const filebook = results[0];

    // Protection: allow if owner, admin, or if featured
    const isOwner = filebook.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin && !filebook.isFeatured) {
        throw new Error("Access denied: This filebook is private");
    }

    // Fetch documents separately via Prisma (since we don't need new fields here)
    const documents = await prisma.document.findMany({
        where: { filebookId: id },
        orderBy: { createdAt: 'desc' }
    });

    return {
        ...filebook,
        documents,
        _count: { documents: filebook.docCount }
    };
}

export async function deleteFilebook(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Verify ownership or check if admin
    const filebook = await prisma.filebook.findFirst({
        where: {
            id,
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found");
    }

    const isOwner = filebook.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized: You cannot delete this filebook");
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

    // Verify ownership or admin
    const filebook = await prisma.filebook.findFirst({
        where: {
            id: filebookId,
        },
        include: {
            user: true
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found");
    }

    const isOwner = filebook.userId === session.user.id;
    const isAdmin = session.user.role === "admin";
    const isPro = filebook.user.plan === "PRO";
    const historyLimit = isPro ? 100 : 30;

    if (!isOwner && !isAdmin && !filebook.isFeatured) {
        throw new Error("Unauthorized");
    }

    // Check message count and delete oldest if needed
    const count = await prisma.chatMessage.count({
        where: { filebookId }
    });

    if (count >= historyLimit) {
        // Delete oldest messages to make room for 2 new messages (this one and potentially the AI response following it)
        // Or just delete enough to be under limit. Let's delete (count - historyLimit + 1) messages.
        const toDeleteCount = count - historyLimit + 1;
        const oldestMessages = await prisma.chatMessage.findMany({
            where: { filebookId },
            orderBy: { createdAt: 'asc' },
            take: toDeleteCount
        });

        if (oldestMessages.length > 0) {
            await prisma.chatMessage.deleteMany({
                where: {
                    id: { in: oldestMessages.map(m => m.id) }
                }
            });
        }
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

    // Verify ownership, featured, or admin
    const filebook = await prisma.filebook.findFirst({
        where: {
            id: filebookId,
        }
    });

    if (!filebook) {
        throw new Error("Filebook not found");
    }

    const isOwner = filebook.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin && !filebook.isFeatured) {
        throw new Error("Unauthorized");
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
export async function requestFeatured(filebookId: string) {
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

    await prisma.$executeRawUnsafe(
        'UPDATE "filebook" SET "isFeaturedRequest" = true WHERE id = $1',
        filebookId
    );

    revalidatePath("/my-files");
    revalidatePath("/admin");
    return { id: filebookId };
}

export async function getFeaturedFilebooks() {
    // We use Raw SQL to bypass the Prisma Client validation since it's out of sync
    const results = await prisma.$queryRawUnsafe(`
        SELECT f.*, 
               u.name as "userName", u.image as "userImage",
               (SELECT COUNT(*)::int FROM "document" d WHERE d."filebookId" = f.id) as "docCount"
        FROM "filebook" f
        JOIN "user" u ON f."userId" = u.id
        WHERE f."isFeatured" = true
        ORDER BY f."updatedAt" DESC
    `);

    // Map the flat SQL result back to the expected structure
    return (results as any[]).map(row => ({
        ...row,
        user: { name: row.userName, image: row.userImage },
        _count: { documents: row.docCount }
    }));
}

export async function getPendingFeaturedRequests() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin only");
    }

    const results = await prisma.$queryRawUnsafe(`
        SELECT f.*, 
               u.name as "userName", u.email as "userEmail"
        FROM "filebook" f
        JOIN "user" u ON f."userId" = u.id
        WHERE f."isFeaturedRequest" = true AND f."isFeatured" = false
        ORDER BY f."createdAt" DESC
    `);

    return (results as any[]).map(row => ({
        ...row,
        user: { name: row.userName, email: row.userEmail }
    }));
}

export async function approveFeatured(filebookId: string, approve: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin only");
    }

    await prisma.$executeRawUnsafe(
        'UPDATE "filebook" SET "isFeaturedRequest" = false, "isFeatured" = $2 WHERE id = $1',
        filebookId,
        approve
    );
    
    const updated = { id: filebookId, isFeatured: approve };

    revalidatePath("/admin");
    revalidatePath("/featured-files");
    return updated;
}

export async function getDashboardStats() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const [filebookCount, documentCount, chatCount] = await Promise.all([
        prisma.filebook.count({ where: { userId: session.user.id } }),
        prisma.document.count({ where: { filebook: { userId: session.user.id } } }),
        prisma.chatMessage.count({ where: { filebook: { userId: session.user.id } } })
    ]);

    return {
        filebookCount,
        documentCount,
        chatCount
    };
}

export async function getRecentActivity() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const recentFilebooks = await prisma.filebook.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
            _count: {
                select: { documents: true }
            }
        }
    });

    return recentFilebooks;
}
