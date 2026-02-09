"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string; username?: string }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                username: data.username,
            }
        });
        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function deleteAccount() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.user.delete({
            where: { id: session.user.id }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete account", error);
        return { success: false, error: "Failed to delete account" };
    }
}

export async function updateSettings(data: { 
    compactSidebar?: boolean; 
    autoSummarization?: boolean; 
    deepReasoningMode?: boolean; 
    emailNotifications?: boolean; 
    inAppNotifs?: boolean;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data
        });
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings", error);
        return { success: false, error: "Failed to update settings" };
    }
}
