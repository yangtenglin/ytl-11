import { useCallback } from 'react';
import type {
  Character,
  EventEntity,
  Clue,
  Relation,
  RuleViolation,
  DetectiveBoardState,
} from '@/types';
import { generateId } from '@/utils/idGenerator';

export const useRulesEngine = () => {
  const checkTimeConflicts = useCallback(
    (characters: Character[], events: EventEntity[]): RuleViolation[] => {
      const violations: RuleViolation[] = [];

      characters.forEach((char) => {
        const charEvents = events.filter((e) => e.participantIds.includes(char.id));
        if (charEvents.length < 2) return;

        const sortedEvents = [...charEvents].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        for (let i = 0; i < sortedEvents.length - 1; i++) {
          const current = sortedEvents[i];
          const next = sortedEvents[i + 1];

          if (!current.timestamp || !next.timestamp) continue;

          const currentTime = new Date(current.timestamp).getTime();
          const nextTime = new Date(next.timestamp).getTime();

          if (nextTime - currentTime < 30 * 60 * 1000) {
            violations.push({
              id: generateId(),
              type: 'time_conflict',
              severity: 'error',
              message: `${char.name} 的时间安排冲突："${current.title}" 与 "${next.title}" 间隔不足 30 分钟`,
              relatedEntityIds: [char.id, current.id, next.id],
              details: `"${current.title}" 时间：${current.timestamp}\n"${next.title}" 时间：${next.timestamp}\n请确认人物是否能在两个地点/事件之间合理移动。`,
            });
          }
        }
      });

      return violations;
    },
    []
  );

  const checkUnexplainedClues = useCallback((clues: Clue[]): RuleViolation[] => {
    const violations: RuleViolation[] = [];

    clues
      .filter((c) => !c.isExplained)
      .forEach((clue) => {
        violations.push({
          id: generateId(),
          type: 'unexplained_clue',
          severity: clue.clueType === 'physical' ? 'warning' : 'info',
          message: `线索"${clue.title}"尚未得到解释`,
          relatedEntityIds: [clue.id],
          details: `类型：${clue.clueType}\n描述：${clue.description}\n建议：在剧情推进中为该线索提供合理的解释说明。`,
        });
      });

    return violations;
  }, []);

  const checkIsolatedCharacters = useCallback(
    (characters: Character[], events: EventEntity[], relations: Relation[]): RuleViolation[] => {
      const violations: RuleViolation[] = [];

      characters.forEach((char) => {
        const hasEvents = events.some((e) => e.participantIds.includes(char.id));
        const hasRelations = relations.some(
          (r) =>
            (r.sourceId === char.id && r.sourceType === 'character') ||
            (r.targetId === char.id && r.targetType === 'character')
        );

        if (!hasEvents && !hasRelations) {
          violations.push({
            id: generateId(),
            type: 'isolated_character',
            severity: 'warning',
            message: `角色"${char.name}"处于孤立状态`,
            relatedEntityIds: [char.id],
            details: `该角色未参与任何事件，也未与其他实体建立关系。\n建议：为其添加关联事件或建立人物关系。`,
          });
        }
      });

      return violations;
    },
    []
  );

  const runAllChecks = useCallback(
    (state: Pick<DetectiveBoardState, 'characters' | 'events' | 'clues' | 'relations'>): RuleViolation[] => {
      return [
        ...checkTimeConflicts(state.characters, state.events),
        ...checkUnexplainedClues(state.clues),
        ...checkIsolatedCharacters(state.characters, state.events, state.relations),
      ];
    },
    [checkTimeConflicts, checkUnexplainedClues, checkIsolatedCharacters]
  );

  return { runAllChecks, checkTimeConflicts, checkUnexplainedClues, checkIsolatedCharacters };
};
