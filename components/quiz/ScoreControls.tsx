"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Search, Plus, Minus } from "lucide-react";

interface Participant {
    id: string;
    name: string;
    score: number;
}

interface ScoreControlsProps {
    participants: Participant[];
    onUpdateScore: (id: string, delta: number) => void;
}

export function ScoreControls({ participants, onUpdateScore }: ScoreControlsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredParticipants = participants.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
    };

    return (
        <Card className="h-full bg-carbon-gray/80 backdrop-blur-sm border-r border-prestige-gold/20 rounded-none rounded-r-2xl flex flex-col">
            <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-xl text-prestige-gold flex items-center gap-2">
                    <Search className="w-5 h-5" /> SCORE MANAGER
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                <Input
                    placeholder="Search participant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-royal-black border-white/10 text-ivory-white focus:border-prestige-gold"
                />

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-prestige-gold/20">
                    {filteredParticipants.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => handleSelect(p.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedId === p.id
                                    ? "bg-prestige-gold/20 border-prestige-gold"
                                    : "bg-white/5 border-transparent hover:bg-white/10"
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-montserrat font-medium text-ivory-white">
                                    {p.name}
                                </span>
                                <span className="font-bebas text-lg text-prestige-gold">
                                    {p.score}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => selectedId && onUpdateScore(selectedId, 4)}
                        disabled={!selectedId}
                        className="bg-emerald-signal text-royal-black hover:bg-emerald-400 font-bold"
                    >
                        <Plus className="w-4 h-4 mr-1" /> COR (+4)
                    </Button>
                    <Button
                        onClick={() => selectedId && onUpdateScore(selectedId, -2)}
                        disabled={!selectedId}
                        variant="destructive"
                        className="font-bold"
                    >
                        <Minus className="w-4 h-4 mr-1" /> WRG (-2)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
