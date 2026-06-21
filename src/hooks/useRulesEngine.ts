import { useCallback } from 'react';
import type {
  Character,
  EventEntity,
  Clue,
  Relation,
  RuleViolation,
  DetectiveBoardState,
  Location,
  CommuteTime,
} from '@/types';
import { generateId } from '@/utils/idGenerator';

function getCommuteMinutes(
  locationAId: string | undefined,
  locationBId: string | undefined,
  commuteTimes: CommuteTime[],
  defaultMinutes: number
): number {
  if (!locationAId || !locationBId) return defaultMinutes;
  if (locationAId === locationBId) return 0;
  const found = commuteTimes.find(
    (ct) =>
      (ct.locationAId === locationAId && ct.locationBId === locationBId) ||
      (ct.locationAId === locationBId && ct.locationBId === locationAId)
  );
  return found ? found.minutes : defaultMinutes;
}

function getLocationName(locations: Location[], locationId?: string): string {
  if (!locationId) return '未知地点';
  const loc = locations.find((l) => l.id === locationId);
  return loc ? loc.name : '未知地点';
}

export function checkTimeConflicts(
  characters: Character[],
  events: EventEntity[],
  locations: Location[],
  commuteTimes: CommuteTime[],
  defaultCommuteMinutes: number
): RuleViolation[] {
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

      const currentEndTime = new Date(
        current.endTimestamp || current.timestamp
      ).getTime();
      const nextStartTime = new Date(next.timestamp).getTime();

      const gapMinutes = (nextStartTime - currentEndTime) / (1000 * 60);

      const commuteMinutes = getCommuteMinutes(
        current.locationId,
        next.locationId,
        commuteTimes,
        defaultCommuteMinutes
      );

      if (gapMinutes < commuteMinutes) {
        const shortage = commuteMinutes - gapMinutes;
        const currentLocName = getLocationName(locations, current.locationId);
        const nextLocName = getLocationName(locations, next.locationId);

        violations.push({
          id: generateId(),
          type: 'time_conflict',
          severity: 'error',
          message: `${char.name} 不在场证明存疑："${current.title}" 与 "${next.title}" 时间冲突`,
          relatedEntityIds: [char.id, current.id, next.id],
          details:
            `"${current.title}" 结束时间：${current.endTimestamp || current.timestamp}（${currentLocName}）\n` +
            `"${next.title}" 开始时间：${next.timestamp}（${nextLocName}）\n` +
            `两事件间隔：${gapMinutes < 0 ? `重叠 ${Math.abs(gapMinutes).toFixed(0)} 分钟` : `${gapMinutes.toFixed(0)} 分钟`}\n` +
            `通勤所需：${commuteMinutes} 分钟\n` +
            `差额：短缺 ${shortage.toFixed(0)} 分钟\n` +
            `不在场核验结论：时间不足以完成通勤，人物可能存在时间冲突！`,
        });
      }
    }
  });

  return violations;
}

export function checkUnexplainedClues(clues: Clue[]): RuleViolation[] {
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
}

export function checkIsolatedCharacters(
  characters: Character[],
  events: EventEntity[],
  relations: Relation[]
): RuleViolation[] {
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
}

export function runAllRuleChecks(
  state: Pick<
    DetectiveBoardState,
    | 'characters'
    | 'events'
    | 'clues'
    | 'relations'
    | 'locations'
    | 'commuteTimes'
    | 'defaultCommuteMinutes'
  >
): RuleViolation[] {
  return [
    ...checkTimeConflicts(
      state.characters,
      state.events,
      state.locations,
      state.commuteTimes,
      state.defaultCommuteMinutes
    ),
    ...checkUnexplainedClues(state.clues),
    ...checkIsolatedCharacters(state.characters, state.events, state.relations),
  ];
}

export function useRulesEngine() {
  const runAllChecks = useCallback(
    (
      state: Pick<
        DetectiveBoardState,
        | 'characters'
        | 'events'
        | 'clues'
        | 'relations'
        | 'locations'
        | 'commuteTimes'
        | 'defaultCommuteMinutes'
      >
    ) => runAllRuleChecks(state),
    []
  );

  return { runAllChecks };
}
