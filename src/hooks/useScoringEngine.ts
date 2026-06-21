import { useCallback } from 'react';
import type {
  Character,
  EventEntity,
  Clue,
  Relation,
  SuspectScore,
  ScoreBreakdownItem,
  DetectiveBoardState,
} from '@/types';

const clueTypeImpact: Record<string, { motive: number; opportunity: number; risk: number }> = {
  physical: { motive: 5, opportunity: 15, risk: 10 },
  testimony: { motive: 12, opportunity: 5, risk: 3 },
  document: { motive: 10, opportunity: 3, risk: 10 },
  digital: { motive: 3, opportunity: 8, risk: 12 },
  other: { motive: 5, opportunity: 5, risk: 5 },
};

const eventImportanceImpact: Record<string, number> = {
  critical: 20,
  high: 12,
  medium: 6,
  low: 2,
};

const relationTypeImpact: Record<string, { motive: number; opportunity: number; risk: number }> = {
  family: { motive: 8, opportunity: 5, risk: 3 },
  professional: { motive: 5, opportunity: 8, risk: 4 },
  romantic: { motive: 15, opportunity: 10, risk: 8 },
  hostile: { motive: 20, opportunity: 5, risk: 12 },
  financial: { motive: 18, opportunity: 8, risk: 10 },
  causal: { motive: 0, opportunity: 0, risk: 0 },
  location: { motive: 0, opportunity: 0, risk: 0 },
  evidence: { motive: 0, opportunity: 0, risk: 0 },
};

export const useScoringEngine = () => {
  const calculateCharacterScore = useCallback(
    (
      character: Character,
      events: EventEntity[],
      clues: Clue[],
      relations: Relation[]
    ): SuspectScore => {
      const motiveBreakdown: ScoreBreakdownItem[] = [];
      const opportunityBreakdown: ScoreBreakdownItem[] = [];
      const riskBreakdown: ScoreBreakdownItem[] = [];

      motiveBreakdown.push({
        source: character.id,
        sourceId: character.id,
        sourceType: 'base',
        value: character.motive,
        label: '基础动机分',
      });

      opportunityBreakdown.push({
        source: character.id,
        sourceId: character.id,
        sourceType: 'base',
        value: character.opportunity,
        label: '基础机会分',
      });

      riskBreakdown.push({
        source: character.id,
        sourceId: character.id,
        sourceType: 'base',
        value: character.risk,
        label: '基础风险分',
      });

      const charEvents = events.filter((e) => e.participantIds.includes(character.id));
      charEvents.forEach((event) => {
        const impact = eventImportanceImpact[event.importance] || 0;
        if (impact > 0) {
          opportunityBreakdown.push({
            source: event.id,
            sourceId: event.id,
            sourceType: 'event',
            value: impact,
            label: `参与事件：${event.title}`,
          });
        }
      });

      const charClues = clues.filter((c) => c.characterId === character.id);
      charClues.forEach((clue) => {
        if (!clue.isExplained) {
          const impact = clueTypeImpact[clue.clueType] || clueTypeImpact.other;
          motiveBreakdown.push({
            source: clue.id,
            sourceId: clue.id,
            sourceType: 'clue',
            value: impact.motive,
            label: `未解释线索：${clue.title}`,
          });
          opportunityBreakdown.push({
            source: clue.id,
            sourceId: clue.id,
            sourceType: 'clue',
            value: impact.opportunity,
            label: `未解释线索：${clue.title}`,
          });
          riskBreakdown.push({
            source: clue.id,
            sourceId: clue.id,
            sourceType: 'clue',
            value: impact.risk,
            label: `未解释线索：${clue.title}`,
          });
        } else {
          const impact = clueTypeImpact[clue.clueType] || clueTypeImpact.other;
          const reduced = Math.floor(impact.motive * 0.3);
          if (reduced > 0) {
            motiveBreakdown.push({
              source: clue.id,
              sourceId: clue.id,
              sourceType: 'clue',
              value: reduced,
              label: `已解释线索：${clue.title}`,
            });
          }
        }
      });

      const charRelations = relations.filter(
        (r) =>
          (r.sourceId === character.id && r.sourceType === 'character') ||
          (r.targetId === character.id && r.targetType === 'character')
      );
      charRelations.forEach((rel) => {
        const otherCharId =
          rel.sourceId === character.id ? rel.targetId : rel.sourceId;
        const otherCharType =
          rel.sourceId === character.id ? rel.targetType : rel.sourceType;

        if (otherCharType === 'character') {
          const impact = relationTypeImpact[rel.relationType];
          if (impact) {
            if (impact.motive !== 0) {
              motiveBreakdown.push({
                source: rel.id,
                sourceId: otherCharId,
                sourceType: 'relation',
                value: impact.motive,
                label: `关系：${rel.label}`,
              });
            }
            if (impact.opportunity !== 0) {
              opportunityBreakdown.push({
                source: rel.id,
                sourceId: otherCharId,
                sourceType: 'relation',
                value: impact.opportunity,
                label: `关系：${rel.label}`,
              });
            }
            if (impact.risk !== 0) {
              riskBreakdown.push({
                source: rel.id,
                sourceId: otherCharId,
                sourceType: 'relation',
                value: impact.risk,
                label: `关系：${rel.label}`,
              });
            }
          }
        }
      });

      const totalMotive = Math.min(
        100,
        motiveBreakdown.reduce((sum, item) => sum + item.value, 0)
      );
      const totalOpportunity = Math.min(
        100,
        opportunityBreakdown.reduce((sum, item) => sum + item.value, 0)
      );
      const totalRisk = Math.min(
        100,
        riskBreakdown.reduce((sum, item) => sum + item.value, 0)
      );

      const total = Math.round((totalMotive + totalOpportunity + totalRisk) / 3);

      return {
        characterId: character.id,
        motive: totalMotive,
        opportunity: totalOpportunity,
        risk: totalRisk,
        total,
        motiveBreakdown,
        opportunityBreakdown,
        riskBreakdown,
      };
    },
    []
  );

  const calculateAllScores = useCallback(
    (state: Pick<DetectiveBoardState, 'characters' | 'events' | 'clues' | 'relations'>): SuspectScore[] => {
      return state.characters
        .map((char) =>
          calculateCharacterScore(char, state.events, state.clues, state.relations)
        )
        .sort((a, b) => b.total - a.total);
    },
    [calculateCharacterScore]
  );

  return { calculateAllScores, calculateCharacterScore };
};
