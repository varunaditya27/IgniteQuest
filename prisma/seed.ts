import { PrismaClient, QuestionPhase } from "@prisma/client";
import phase1Questions from "../data/questions/phase1.json";
import phase2Questions from "../data/questions/phase2.json";

const prisma = new PrismaClient();

const EVENT_ID = process.env.EVENT_ID;
const EVENT_NAME = "IgniteQuest — Python Arena 2026";

type QuestionSeed = {
  order: number;
  topic: string;
  text: string;
  codeSnippet: string | null;
  options: string[];
  correctOption: number;
  points: number;
};

async function seedPhase(eventId: string, phase: QuestionPhase, questions: QuestionSeed[]) {
  for (const q of questions) {
    await prisma.question.create({
      data: {
        eventId,
        phase,
        order: q.order,
        topic: q.topic,
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
  if (!EVENT_ID) throw new Error("EVENT_ID env var is required to seed");

  const event = await prisma.event.upsert({
    where: { id: EVENT_ID },
    create: { id: EVENT_ID, name: EVENT_NAME },
    update: { name: EVENT_NAME },
  });

  // Full prune + add: deleting a Question cascades its TeamAnswer and
  // LifelineUsage rows. Only run this before an event starts, or against a
  // rehearsal/reset — never mid-event with live team data.
  await prisma.question.deleteMany({ where: { eventId: event.id } });

  await seedPhase(event.id, "PHASE_1", phase1Questions as QuestionSeed[]);
  await seedPhase(event.id, "PHASE_2", phase2Questions as QuestionSeed[]);

  await prisma.gameState.upsert({
    where: { eventId: event.id },
    create: { eventId: event.id, stage: "LOBBY" },
    update: {},
  });

  console.log(
    `Seeded event "${event.name}": ${phase1Questions.length} Phase 1 questions, ${phase2Questions.length} Phase 2 questions.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
