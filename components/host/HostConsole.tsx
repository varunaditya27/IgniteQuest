"use client";
import { useState } from "react";
import type { ClientGameState, ClientTeam } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";
import { LobbyPanel } from "@/components/host/LobbyPanel";
import { InterstitialPanel } from "@/components/host/InterstitialPanel";
import { Phase1Panel } from "@/components/host/Phase1Panel";
import { TiebreakPanel } from "@/components/host/TiebreakPanel";
import { QualifiersRevealPanel } from "@/components/host/QualifiersRevealPanel";
import { Phase2LobbyPanel } from "@/components/host/Phase2LobbyPanel";
import { Phase2QuestionPanel } from "@/components/host/Phase2QuestionPanel";
import { FinalePanel } from "@/components/host/FinalePanel";
import type { LifelineType } from "@/components/host/LifelineButtons";
import type { NextTurnResult } from "@/lib/actions/host-phase1";
import type { FinishPhase2Result } from "@/lib/actions/host-phase2";
import type { TiebreakResolution } from "@/lib/actions/host-tiebreak";

export type LifelineUsageLite = { teamId: string; type: LifelineType };

export function HostConsole({
  initialState,
  initialTeams,
  initialLifelineUsages,
  eventName,
  eventId,
  phase1TimeLimitSeconds,
  phase2TimeLimitSeconds,
}: {
  initialState: ClientGameState;
  initialTeams: ClientTeam[];
  initialLifelineUsages: LifelineUsageLite[];
  eventName: string;
  eventId: string;
  phase1TimeLimitSeconds: number;
  phase2TimeLimitSeconds: number;
}) {
  const [state, setState] = useState(initialState);
  const [teams, setTeams] = useState(initialTeams);
  const [lifelineUsages, setLifelineUsages] = useState(initialLifelineUsages);
  const [finalePodium, setFinalePodium] = useState<{ id: string; rank: number }[]>([]);

  // Every host action returns a full server-computed GameState (and often
  // teams) — the client only ever reflects that, never predicts it, so
  // score and stage transitions stay trustworthy under retries.
  const applyRaw = (raw: Parameters<typeof toClientGameState>[0]) => setState(toClientGameState(raw));

  const handleNextTurnResult = (result: NextTurnResult) => {
    if (result.kind === "interstitial") {
      applyRaw(result.state);
    } else if (result.kind === "tiebreak") {
      setState((prev) => ({ ...prev, stage: "PHASE1_TIEBREAK", tiebreakTeamIds: result.teamIds }));
    } else {
      const qualified = new Set(result.qualifiedTeamIds);
      setTeams((prev) => prev.map((t) => ({ ...t, qualified: qualified.has(t.id) })));
      setState((prev) => ({
        ...prev,
        stage: "PHASE1_QUALIFIERS_REVEAL",
        currentQuestionId: null,
        currentQuestion: null,
        activeTeamId: null,
        activeTeam: null,
      }));
    }
  };

  const sharedProps = { eventName, state, teams, setTeams, applyRaw };

  switch (state.stage) {
    case "LOBBY":
      return <LobbyPanel {...sharedProps} onStarted={applyRaw} />;
    case "PHASE1_INTERSTITIAL":
      return <InterstitialPanel {...sharedProps} onAdvanced={applyRaw} />;
    case "PHASE1_QUESTION":
      return (
        <Phase1Panel
          {...sharedProps}
          lifelineUsages={lifelineUsages}
          setLifelineUsages={setLifelineUsages}
          onRevealed={(state, teams) => {
            applyRaw(state);
            setTeams(teams);
          }}
          onNextTurn={handleNextTurnResult}
          phase1TimeLimitSeconds={phase1TimeLimitSeconds}
        />
      );
    case "PHASE1_TIEBREAK":
    case "PHASE2_TIEBREAK":
      return (
        <TiebreakPanel
          {...sharedProps}
          key={state.tiebreakTeamIds.join(",")}
          teamIds={state.tiebreakTeamIds}
          onResolved={(result: TiebreakResolution) => {
            if (result.kind === "tiebreak") {
              setState((prev) => ({ ...prev, tiebreakTeamIds: result.teamIds }));
            } else if (result.kind === "qualifiers_revealed") {
              const qualified = new Set(result.qualifiedTeamIds);
              setTeams((prev) => prev.map((t) => ({ ...t, qualified: qualified.has(t.id) })));
              setState((prev) => ({ ...prev, stage: "PHASE1_QUALIFIERS_REVEAL", tiebreakTeamIds: [] }));
            } else {
              setFinalePodium(result.podium);
              setState((prev) => ({ ...prev, stage: "FINALE", tiebreakTeamIds: [] }));
            }
          }}
        />
      );
    case "PHASE1_QUALIFIERS_REVEAL":
      return <QualifiersRevealPanel {...sharedProps} onStartedPhase2={applyRaw} />;
    case "PHASE2_LOBBY":
      return (
        <Phase2LobbyPanel
          {...sharedProps}
          onFinished={(result: FinishPhase2Result) => {
            if (result.kind === "tiebreak") {
              setState((prev) => ({ ...prev, stage: "PHASE2_TIEBREAK", tiebreakTeamIds: result.teamIds }));
            } else {
              setFinalePodium(result.podium);
              setState((prev) => ({ ...prev, stage: "FINALE" }));
            }
          }}
        />
      );
    case "PHASE2_QUESTION":
      return <Phase2QuestionPanel {...sharedProps} eventId={eventId} phase2TimeLimitSeconds={phase2TimeLimitSeconds} />;
    case "FINALE":
      return <FinalePanel eventName={eventName} teams={teams} podium={finalePodium} />;
    default:
      return null;
  }
}
