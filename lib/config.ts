function int(name: string, fallback: number): number {
    const value = process.env[name];
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export const gameConfig = {
    finalistCount: int("FINALIST_COUNT", 4),
    phase1TimeLimitSeconds: int("PHASE1_TIME_LIMIT_SECONDS", 60),
    phase2TimeLimitSeconds: int("PHASE2_TIME_LIMIT_SECONDS", 20),
    // Correct-answer points come from each Question's own `points` field, not a
    // global constant — see data/questions/*.json.
    wrongAnswerPoints: int("WRONG_ANSWER_POINTS", 0),
};
