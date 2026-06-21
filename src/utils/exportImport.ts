import type { DetectiveBoardState, Character, EventEntity, Location, Clue, Hypothesis, Evidence, Relation, CommuteTime } from '@/types';
import { now } from '@/utils/idGenerator';

export const exportToJSON = (state: DetectiveBoardState): string => {
  const data = {
    characters: state.characters,
    events: state.events,
    locations: state.locations,
    clues: state.clues,
    hypotheses: state.hypotheses,
    evidences: state.evidences,
    relations: state.relations,
    commuteTimes: state.commuteTimes,
    defaultCommuteMinutes: state.defaultCommuteMinutes,
    explanationQueue: state.explanationQueue,
    explanationHistory: state.explanationHistory,
    zoom: state.zoom,
    pan: state.pan,
    exportedAt: new Date().toISOString(),
    version: '1.2',
  };
  return JSON.stringify(data, null, 2);
};

const migrateCharacter = (char: Partial<Character>): Character => {
  const t = now();
  return {
    id: char.id || '',
    type: 'character',
    name: char.name || '',
    description: char.description || '',
    avatarColor: char.avatarColor || '#666666',
    motive: char.motive ?? 0,
    opportunity: char.opportunity ?? 0,
    risk: char.risk ?? 0,
    alias: char.alias,
    role: char.role,
    notes: char.notes,
    position: char.position,
    createdAt: char.createdAt || t,
    updatedAt: char.updatedAt || t,
  };
};

const migrateEvent = (event: Partial<EventEntity>): EventEntity => {
  const t = now();
  return {
    id: event.id || '',
    type: 'event',
    title: event.title || '',
    description: event.description || '',
    timestamp: event.timestamp || t,
    endTimestamp: event.endTimestamp || event.timestamp || t,
    importance: event.importance || 'medium',
    participantIds: event.participantIds || [],
    locationId: event.locationId,
    position: event.position,
    createdAt: event.createdAt || t,
    updatedAt: event.updatedAt || t,
  };
};

const migrateLocation = (loc: Partial<Location>): Location => {
  const t = now();
  return {
    id: loc.id || '',
    type: 'location',
    name: loc.name || '',
    description: loc.description || '',
    locationType: loc.locationType,
    position: loc.position,
    createdAt: loc.createdAt || t,
    updatedAt: loc.updatedAt || t,
  };
};

const migrateClue = (clue: Partial<Clue>): Clue => {
  const t = now();
  return {
    id: clue.id || '',
    type: 'clue',
    title: clue.title || '',
    description: clue.description || '',
    clueType: clue.clueType || 'other',
    isExplained: clue.isExplained ?? false,
    explanation: clue.explanation,
    eventId: clue.eventId,
    characterId: clue.characterId,
    locationId: clue.locationId,
    position: clue.position,
    createdAt: clue.createdAt || t,
    updatedAt: clue.updatedAt || t,
  };
};

const migrateHypothesis = (hypo: Partial<Hypothesis>): Hypothesis => {
  const t = now();
  return {
    id: hypo.id || '',
    type: 'hypothesis',
    title: hypo.title || '',
    description: hypo.description || '',
    status: hypo.status || 'pending',
    accepted: hypo.accepted ?? false,
    suspectId: hypo.suspectId,
    verifiedAt: hypo.verifiedAt,
    position: hypo.position,
    createdAt: hypo.createdAt || t,
    updatedAt: hypo.updatedAt || t,
  };
};

const migrateEvidence = (ev: Partial<Evidence>): Evidence => {
  const t = now();
  return {
    id: ev.id || '',
    hypothesisId: ev.hypothesisId || '',
    clueId: ev.clueId || '',
    type: ev.type || 'supporting',
    description: ev.description || '',
    createdAt: ev.createdAt || t,
  };
};

const migrateRelation = (rel: Partial<Relation>): Relation => {
  const t = now();
  return {
    id: rel.id || '',
    sourceId: rel.sourceId || '',
    sourceType: rel.sourceType || 'character',
    targetId: rel.targetId || '',
    targetType: rel.targetType || 'character',
    relationType: rel.relationType || '',
    label: rel.label || '',
    description: rel.description,
    createdAt: rel.createdAt || t,
  };
};

const migrateCommuteTime = (ct: Partial<CommuteTime>): CommuteTime => {
  const t = now();
  return {
    id: ct.id || '',
    locationAId: ct.locationAId || '',
    locationBId: ct.locationBId || '',
    minutes: ct.minutes ?? 30,
    createdAt: ct.createdAt || t,
  };
};

export const importFromJSON = (json: string): Partial<DetectiveBoardState> => {
  const data = JSON.parse(json);

  const characters: Character[] = (data.characters || []).map(migrateCharacter);
  const events: EventEntity[] = (data.events || []).map(migrateEvent);
  const locations: Location[] = (data.locations || []).map(migrateLocation);
  const clues: Clue[] = (data.clues || []).map(migrateClue);
  const hypotheses: Hypothesis[] = (data.hypotheses || []).map(migrateHypothesis);
  const evidences: Evidence[] = (data.evidences || []).map(migrateEvidence);
  const relations: Relation[] = (data.relations || []).map(migrateRelation);
  const commuteTimes: CommuteTime[] = (data.commuteTimes || []).map(migrateCommuteTime);

  return {
    characters,
    events,
    locations,
    clues,
    hypotheses,
    evidences,
    relations,
    commuteTimes,
    defaultCommuteMinutes: data.defaultCommuteMinutes ?? 30,
    explanationQueue: data.explanationQueue || [],
    explanationHistory: data.explanationHistory || [],
    zoom: data.zoom || 1,
    pan: data.pan || { x: 0, y: 0 },
  };
};

export const downloadJSON = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
