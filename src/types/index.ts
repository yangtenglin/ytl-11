export type EntityType = 'character' | 'event' | 'location' | 'clue' | 'hypothesis';

export type EvidenceType = 'supporting' | 'refuting';

export interface Evidence {
  id: string;
  hypothesisId: string;
  clueId: string;
  type: EvidenceType;
  description: string;
  createdAt: string;
}

export interface Hypothesis extends BaseEntity {
  type: 'hypothesis';
  title: string;
  description: string;
  suspectId?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  accepted: boolean;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  position?: { x: number; y: number };
}

export interface Character extends BaseEntity {
  type: 'character';
  name: string;
  alias?: string;
  role?: string;
  description: string;
  avatarColor: string;
  notes?: string;
  motive: number;
  opportunity: number;
  risk: number;
}

export interface SuspectScore {
  characterId: string;
  motive: number;
  opportunity: number;
  risk: number;
  total: number;
  motiveBreakdown: ScoreBreakdownItem[];
  opportunityBreakdown: ScoreBreakdownItem[];
  riskBreakdown: ScoreBreakdownItem[];
}

export interface ScoreBreakdownItem {
  source: string;
  sourceId: string;
  sourceType: 'base' | 'clue' | 'relation' | 'event';
  value: number;
  label: string;
}

export interface EventEntity extends BaseEntity {
  type: 'event';
  title: string;
  description: string;
  timestamp: string;
  endTimestamp: string;
  locationId?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  participantIds: string[];
}

export interface CommuteTime {
  id: string;
  locationAId: string;
  locationBId: string;
  minutes: number;
  createdAt: string;
}

export interface Location extends BaseEntity {
  type: 'location';
  name: string;
  locationType?: string;
  description: string;
}

export interface Clue extends BaseEntity {
  type: 'clue';
  title: string;
  description: string;
  clueType: 'physical' | 'testimony' | 'document' | 'digital' | 'other';
  eventId?: string;
  characterId?: string;
  locationId?: string;
  isExplained: boolean;
  explanation?: string;
}

export type AnyEntity = Character | EventEntity | Location | Clue | Hypothesis;

export interface Relation {
  id: string;
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  relationType: string;
  label: string;
  description?: string;
  createdAt: string;
}

export type ViolationType = 'time_conflict' | 'unexplained_clue' | 'isolated_character';
export type ViolationSeverity = 'warning' | 'error' | 'info';

export interface RuleViolation {
  id: string;
  type: ViolationType;
  severity: ViolationSeverity;
  message: string;
  relatedEntityIds: string[];
  details: string;
}

export interface DetectiveBoardState {
  characters: Character[];
  events: EventEntity[];
  locations: Location[];
  clues: Clue[];
  hypotheses: Hypothesis[];
  evidences: Evidence[];
  relations: Relation[];
  commuteTimes: CommuteTime[];
  defaultCommuteMinutes: number;
  selectedEntityId: string | null;
  selectedEntityType: EntityType | null;
  timeRangeFilter: { start: string | null; end: string | null };
  violations: RuleViolation[];
  zoom: number;
  pan: { x: number; y: number };
  isCreatingRelation: boolean;
  relationSource: { id: string; type: EntityType } | null;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  suspectScores: SuspectScore[];
  rightPanelTab: 'rules' | 'scores' | 'commute';
}

export interface DetectiveBoardActions {
  addCharacter: (data: Omit<Character, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateCharacter: (id: string, data: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addEvent: (data: Omit<EventEntity, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, data: Partial<EventEntity>) => void;
  deleteEvent: (id: string) => void;
  addLocation: (data: Omit<Location, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateLocation: (id: string, data: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  addCommuteTime: (data: Omit<CommuteTime, 'id' | 'createdAt'>) => void;
  updateCommuteTime: (id: string, data: Partial<CommuteTime>) => void;
  deleteCommuteTime: (id: string) => void;
  setDefaultCommuteMinutes: (minutes: number) => void;
  getCommuteMinutes: (locationAId: string, locationBId: string) => number;
  addClue: (data: Omit<Clue, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateClue: (id: string, data: Partial<Clue>) => void;
  deleteClue: (id: string) => void;
  addHypothesis: (data: Omit<Hypothesis, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateHypothesis: (id: string, data: Partial<Hypothesis>) => void;
  deleteHypothesis: (id: string) => void;
  addEvidence: (data: Omit<Evidence, 'id' | 'createdAt'>) => void;
  updateEvidence: (id: string, data: Partial<Evidence>) => void;
  deleteEvidence: (id: string) => void;
  toggleHypothesisAccepted: (id: string) => void;
  addRelation: (data: Omit<Relation, 'id' | 'createdAt'>) => void;
  updateRelation: (id: string, data: Partial<Relation>) => void;
  deleteRelation: (id: string) => void;
  selectEntity: (id: string | null, type: EntityType | null) => void;
  setTimeRangeFilter: (start: string | null, end: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  updateEntityPosition: (id: string, type: EntityType, position: { x: number; y: number }) => void;
  startRelationCreation: (id: string, type: EntityType) => void;
  cancelRelationCreation: () => void;
  runRulesCheck: () => void;
  calculateSuspectScores: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'rules' | 'scores' | 'commute') => void;
  exportData: () => string;
  importData: (json: string) => void;
  clearAll: () => void;
}

export type BoardStore = DetectiveBoardState & DetectiveBoardActions;
