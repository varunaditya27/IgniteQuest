"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getParticipants() {
    try {
        return await prisma.participant.findMany({
            orderBy: { score: "desc" },
        });
    } catch (error) {
        console.error("Failed to fetch participants:", error);
        return [];
    }
}

export async function updateScore(id: string, delta: number) {
    try {
        await prisma.participant.update({
            where: { id },
            data: { score: { increment: delta } },
        });
        revalidatePath("/quiz");
        return { success: true };
    } catch (error) {
        console.error("Failed to update score:", error);
        return { success: false, error };
    }
}

export async function getQuestions() {
    try {
        return await prisma.question.findMany({
            orderBy: { createdAt: "asc" },
        });
    } catch (error) {
        console.error("Failed to fetch questions:", error);
        return [];
    }
}
