"use client";

import { useState, useEffect } from "react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { Leaderboard } from "@/components/quiz/Leaderboard";
import { ScoreControls } from "@/components/quiz/ScoreControls";
import { getParticipants, getQuestions, updateScore } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft } from "lucide-react";

// Mock data for initial render or fallback
const MOCK_QUESTIONS = [
    {
        id: "q1",
        text: "What is the time complexity of QuickSort in the worst case?",
        options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
        correctOption: 2,
    },
    {
        id: "q2",
        text: "Which protocol is used for secure communication over a computer network?",
        options: ["HTTP", "FTP", "HTTPS", "SMTP"],
        correctOption: 2,
    },
];

const MOCK_PARTICIPANTS = [
    { id: "p1", name: "Team Alpha", score: 10 },
    { id: "p2", name: "Team Beta", score: 8 },
    { id: "p3", name: "Team Gamma", score: 12 },
    { id: "p4", name: "Team Delta", score: 6 },
];

export default function QuizPage() {
    const [questions, setQuestions] = useState<any[]>(MOCK_QUESTIONS);
    const [participants, setParticipants] = useState<any[]>(MOCK_PARTICIPANTS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            const [p, q] = await Promise.all([getParticipants(), getQuestions()]);
            if (p && p.length > 0) setParticipants(p);
            if (q && q.length > 0) setQuestions(q);
        };
        fetchData();

        // Poll for leaderboard updates every 5 seconds
        const interval = setInterval(async () => {
            const p = await getParticipants();
            if (p && p.length > 0) setParticipants(p);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleScoreUpdate = async (id: string, delta: number) => {
        // Optimistic update
        setParticipants((prev) =>
            prev.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p))
        );
        await updateScore(id, delta);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <main className="flex h-screen bg-royal-black overflow-hidden">
            {/* Left Panel: Score Controls */}
            <div className="w-1/4 h-full z-10">
                <ScoreControls participants={participants} onUpdateScore={handleScoreUpdate} />
            </div>

            {/* Center Panel: Question */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-0">
                {/* Background Ambient Light */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-prestige-gold/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-4xl mb-8">
                    <div className="flex justify-between items-center mb-4 text-ivory-white/50 font-montserrat">
                        <span>QUESTION {currentQuestionIndex + 1} / {questions.length}</span>
                        <span>IGNITE QUEST</span>
                    </div>
                    {currentQuestion && (
                        <QuestionCard question={currentQuestion} />
                    )}
                </div>

                <div className="flex gap-4 mt-8">
                    <Button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> PREV
                    </Button>
                    <Button
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="bg-prestige-gold text-royal-black hover:bg-electric-yellow font-bold"
                    >
                        NEXT <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Right Panel: Leaderboard */}
            <div className="w-1/4 h-full z-10">
                <Leaderboard participants={participants} />
            </div>
        </main>
    );
}
