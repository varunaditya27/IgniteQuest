import { PrismaClient, QuestionPhase, QuestionType } from "@prisma/client";
import phase1Questions from "../data/questions/phase1.json";
import phase2Questions from "../data/questions/phase2.json";

const prisma = new PrismaClient();

type SeedQuestion = {
    order: number;
    type: string;
    text: string;
    codeSnippet: string | null;
    options: string[];
    correctOption: number;
    points: number;
};

async function seedQuestions(eventId: string, phase: QuestionPhase, questions: SeedQuestion[]) {
    for (const q of questions) {
        await prisma.question.upsert({
            where: { eventId_phase_order: { eventId, phase, order: q.order } },
            update: {},
            create: {
                eventId,
                phase,
                order: q.order,
                type: q.type as QuestionType,
                text: q.text,
                codeSnippet: q.codeSnippet,
                options: q.options,
                correctOption: q.correctOption,
                points: q.points,
            },
        });
    }
}

async function main() {
    const eventId = process.env.EVENT_ID ?? "ignitequest-2026";

    const event = await prisma.event.upsert({
        where: { id: eventId },
        update: {},
        create: { id: eventId, name: "IgniteQuest — Python Arena 2026" },
    });

    await seedQuestions(event.id, QuestionPhase.PHASE_1, phase1Questions);
    await seedQuestions(event.id, QuestionPhase.PHASE_2, phase2Questions);

    await prisma.gameState.upsert({
        where: { eventId: event.id },
        update: {},
        create: { eventId: event.id },
    });

    console.log(`Seeded event "${event.name}" (${event.id}) with ${phase1Questions.length} Phase 1 and ${phase2Questions.length} Phase 2 questions.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
