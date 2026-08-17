import type { Question } from "@prisma/client";
import type { PublicQuestion } from "@/lib/realtime/events";

export function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    order: question.order,
    text: question.text,
    codeSnippet: question.codeSnippet,
    topic: question.topic,
    options: question.options as string[],
  };
}
