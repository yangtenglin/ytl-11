import { create } from 'zustand';
import type {
  BoardStore,
  Character,
  EventEntity,
  Location,
  Clue,
  Relation,
  EntityType,
  Hypothesis,
  Evidence,
} from '@/types';
import { generateId, now, clamp } from '@/utils/idGenerator';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';
import { useRulesEngine } from '@/hooks/useRulesEngine';
import { calculateAllScores } from '@/lib/scoring';
import { createMockData } from '@/data/mockData';

const mockData = createMockData();

export const useBoardStore = create<BoardStore>((set, get) => {
  const { runAllChecks } = useRulesEngine();

  const checkRules = (state: Partial<BoardStore>) => {
    const current = get();
    const merged = { ...current, ...state };
    const violations = runAllChecks({
      characters: merged.characters,
      events: merged.events,
      clues: merged.clues,
      relations: merged.relations,
    });
    return { violations };
  };

  const recalculateScores = (state: Partial<BoardStore>) => {
    const current = get();
    const merged = { ...current, ...state };
    const suspectScores = calculateAllScores({
      characters: merged.characters,
      events: merged.events,
      clues: merged.clues,
      relations: merged.relations,
    });
    return { suspectScores };
  };

  const checkHypothesisStatus = (
    hypothesisId: string,
    evidences: Evidence[]
  ): { status: Hypothesis['status']; verifiedAt?: string } => {
    const hypoEvidences = evidences.filter((e) => e.hypothesisId === hypothesisId);
    const supportingCount = hypoEvidences.filter((e) => e.type === 'supporting').length;
    const refutingCount = hypoEvidences.filter((e) => e.type === 'refuting').length;

    if (refutingCount > 0 && refutingCount >= supportingCount) {
      return { status: 'rejected' };
    }
    if (supportingCount >= 3) {
      return { status: 'verified', verifiedAt: now() };
    }
    return { status: 'pending' };
  };

  const recalcAllHypothesisStatuses = (evidences: Evidence[], hypotheses: Hypothesis[]) => {
    return hypotheses.map((h) => {
      const result = checkHypothesisStatus(h.id, evidences);
      return { ...h, status: result.status, verifiedAt: result.verifiedAt ?? h.verifiedAt };
    });
  };

  return {
    characters: mockData.characters,
    events: mockData.events,
    locations: mockData.locations,
    clues: mockData.clues,
    hypotheses: mockData.hypotheses,
    evidences: mockData.evidences,
    relations: mockData.relations,
    selectedEntityId: null,
    selectedEntityType: null,
    timeRangeFilter: { start: null, end: null },
    violations: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    isCreatingRelation: false,
    relationSource: null,
    leftPanelOpen: true,
    rightPanelOpen: true,
    suspectScores: calculateAllScores({
      characters: mockData.characters,
      events: mockData.events,
      clues: mockData.clues,
      relations: mockData.relations,
    }),
    rightPanelTab: 'scores',

    addCharacter: (data) => {
      const char: Character = {
        ...data,
        id: generateId(),
        type: 'character',
        createdAt: now(),
        updatedAt: now(),
      };
      const newCharacters = [...get().characters, char];
      const partial = { characters: newCharacters };
      set((state) => ({
        ...partial,
        ...checkRules(partial),
        ...recalculateScores(partial),
      }));
    },

    updateCharacter: (id, data) => {
      set((state) => {
        const updated = state.characters.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: now() } : c
        );
        const partial = { characters: updated };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    deleteCharacter: (id) => {
      set((state) => {
        const newChars = state.characters.filter((c) => c.id !== id);
        const newRelations = state.relations.filter(
          (r) =>
            !(r.sourceId === id && r.sourceType === 'character') &&
            !(r.targetId === id && r.targetType === 'character')
        );
        const newEvents = state.events.map((e) => ({
          ...e,
          participantIds: e.participantIds.filter((pid) => pid !== id),
        }));
        const newClues = state.clues.map((c) =>
          c.characterId === id ? { ...c, characterId: undefined } : c
        );
        const newHypotheses = state.hypotheses.map((h) =>
          h.suspectId === id ? { ...h, suspectId: undefined } : h
        );
        const partial = {
          characters: newChars,
          relations: newRelations,
          events: newEvents,
          clues: newClues,
          hypotheses: newHypotheses,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    addEvent: (data) => {
      const ev: EventEntity = {
        ...data,
        id: generateId(),
        type: 'event',
        createdAt: now(),
        updatedAt: now(),
      };
      set((state) => {
        const newEvents = [...state.events, ev];
        const partial = { events: newEvents };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    updateEvent: (id, data) => {
      set((state) => {
        const updated = state.events.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: now() } : e
        );
        const partial = { events: updated };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    deleteEvent: (id) => {
      set((state) => {
        const newEvents = state.events.filter((e) => e.id !== id);
        const newRelations = state.relations.filter(
          (r) =>
            !(r.sourceId === id && r.sourceType === 'event') &&
            !(r.targetId === id && r.targetType === 'event')
        );
        const newClues = state.clues.map((c) =>
          c.eventId === id ? { ...c, eventId: undefined } : c
        );
        const partial = {
          events: newEvents,
          relations: newRelations,
          clues: newClues,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    addLocation: (data) => {
      const loc: Location = {
        ...data,
        id: generateId(),
        type: 'location',
        createdAt: now(),
        updatedAt: now(),
      };
      set((state) => ({ locations: [...state.locations, loc] }));
    },

    updateLocation: (id, data) => {
      set((state) => ({
        locations: state.locations.map((l) =>
          l.id === id ? { ...l, ...data, updatedAt: now() } : l
        ),
      }));
    },

    deleteLocation: (id) => {
      set((state) => {
        const newLocations = state.locations.filter((l) => l.id !== id);
        const newRelations = state.relations.filter(
          (r) =>
            !(r.sourceId === id && r.sourceType === 'location') &&
            !(r.targetId === id && r.targetType === 'location')
        );
        const newEvents = state.events.map((e) =>
          e.locationId === id ? { ...e, locationId: undefined } : e
        );
        const newClues = state.clues.map((c) =>
          c.locationId === id ? { ...c, locationId: undefined } : c
        );
        return {
          locations: newLocations,
          relations: newRelations,
          events: newEvents,
          clues: newClues,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
      });
    },

    addClue: (data) => {
      const clue: Clue = {
        ...data,
        id: generateId(),
        type: 'clue',
        createdAt: now(),
        updatedAt: now(),
      };
      set((state) => {
        const newClues = [...state.clues, clue];
        const partial = { clues: newClues };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    updateClue: (id, data) => {
      set((state) => {
        const updated = state.clues.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: now() } : c
        );
        const partial = { clues: updated };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    deleteClue: (id) => {
      set((state) => {
        const newClues = state.clues.filter((c) => c.id !== id);
        const newRelations = state.relations.filter(
          (r) =>
            !(r.sourceId === id && r.sourceType === 'clue') &&
            !(r.targetId === id && r.targetType === 'clue')
        );
        const newEvidences = state.evidences.filter((e) => e.clueId !== id);
        const newHypotheses = recalcAllHypothesisStatuses(newEvidences, state.hypotheses);
        const partial = {
          clues: newClues,
          relations: newRelations,
          evidences: newEvidences,
          hypotheses: newHypotheses,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
        return {
          ...partial,
          ...checkRules(partial),
          ...recalculateScores(partial),
        };
      });
    },

    addHypothesis: (data) => {
      const hypo: Hypothesis = {
        ...data,
        id: generateId(),
        type: 'hypothesis',
        createdAt: now(),
        updatedAt: now(),
      };
      set((state) => ({ hypotheses: [...state.hypotheses, hypo] }));
    },

    updateHypothesis: (id, data) => {
      set((state) => {
        const updated = state.hypotheses.map((h) =>
          h.id === id ? { ...h, ...data, updatedAt: now() } : h
        );
        return { hypotheses: updated };
      });
    },

    deleteHypothesis: (id) => {
      set((state) => {
        const newHypotheses = state.hypotheses.filter((h) => h.id !== id);
        const newEvidences = state.evidences.filter((e) => e.hypothesisId !== id);
        const newRelations = state.relations.filter(
          (r) =>
            !(r.sourceId === id && r.sourceType === 'hypothesis') &&
            !(r.targetId === id && r.targetType === 'hypothesis')
        );
        return {
          hypotheses: newHypotheses,
          evidences: newEvidences,
          relations: newRelations,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
      });
    },

    addEvidence: (data) => {
      const ev: Evidence = {
        ...data,
        id: generateId(),
        createdAt: now(),
      };
      set((state) => {
        const newEvidences = [...state.evidences, ev];
        const newHypotheses = recalcAllHypothesisStatuses(newEvidences, state.hypotheses);
        return { evidences: newEvidences, hypotheses: newHypotheses };
      });
    },

    updateEvidence: (id, data) => {
      set((state) => {
        const updated = state.evidences.map((e) => (e.id === id ? { ...e, ...data } : e));
        const newHypotheses = recalcAllHypothesisStatuses(updated, state.hypotheses);
        return { evidences: updated, hypotheses: newHypotheses };
      });
    },

    deleteEvidence: (id) => {
      set((state) => {
        const newEvidences = state.evidences.filter((e) => e.id !== id);
        const newHypotheses = recalcAllHypothesisStatuses(newEvidences, state.hypotheses);
        return { evidences: newEvidences, hypotheses: newHypotheses };
      });
    },

    toggleHypothesisAccepted: (id) => {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) =>
          h.id === id && h.status === 'verified'
            ? { ...h, accepted: !h.accepted, updatedAt: now() }
            : h
        ),
      }));
    },

    addRelation: (data) => {
      const rel: Relation = {
        ...data,
        id: generateId(),
        createdAt: now(),
      };
      set((state) => {
        const newRelations = [...state.relations, rel];
        const partial = {
          relations: newRelations,
          isCreatingRelation: false,
          relationSource: null,
        };
        return {
          ...partial,
          ...recalculateScores(partial),
        };
      });
    },

    updateRelation: (id, data) => {
      set((state) => {
        const newRelations = state.relations.map((r) =>
          r.id === id ? { ...r, ...data } : r
        );
        const partial = { relations: newRelations };
        return {
          ...partial,
          ...recalculateScores(partial),
        };
      });
    },

    deleteRelation: (id) => {
      set((state) => {
        const newRelations = state.relations.filter((r) => r.id !== id);
        const partial = { relations: newRelations };
        return {
          ...partial,
          ...recalculateScores(partial),
        };
      });
    },

    selectEntity: (id, type) => {
      set({ selectedEntityId: id, selectedEntityType: type });
    },

    setTimeRangeFilter: (start, end) => {
      set({ timeRangeFilter: { start, end } });
    },

    setZoom: (zoom) => {
      set({ zoom: clamp(zoom, 0.3, 3) });
    },

    setPan: (pan) => {
      set({ pan });
    },

    updateEntityPosition: (id, type, position) => {
      set((state) => {
        switch (type) {
          case 'character':
            return {
              characters: state.characters.map((c) =>
                c.id === id ? { ...c, position } : c
              ),
            };
          case 'event':
            return {
              events: state.events.map((e) =>
                e.id === id ? { ...e, position } : e
              ),
            };
          case 'location':
            return {
              locations: state.locations.map((l) =>
                l.id === id ? { ...l, position } : l
              ),
            };
          case 'clue':
            return {
              clues: state.clues.map((c) =>
                c.id === id ? { ...c, position } : c
              ),
            };
          case 'hypothesis':
            return {
              hypotheses: state.hypotheses.map((h) =>
                h.id === id ? { ...h, position } : h
              ),
            };
          default:
            return {};
        }
      });
    },

    startRelationCreation: (id, type) => {
      set({
        isCreatingRelation: true,
        relationSource: { id, type },
      });
    },

    cancelRelationCreation: () => {
      set({
        isCreatingRelation: false,
        relationSource: null,
      });
    },

    runRulesCheck: () => {
      const state = get();
      const violations = runAllChecks({
        characters: state.characters,
        events: state.events,
        clues: state.clues,
        relations: state.relations,
      });
      set({ violations });
    },

    calculateSuspectScores: () => {
      const state = get();
      const suspectScores = calculateAllScores({
        characters: state.characters,
        events: state.events,
        clues: state.clues,
        relations: state.relations,
      });
      set({ suspectScores });
    },

    toggleLeftPanel: () => {
      set((state) => ({ leftPanelOpen: !state.leftPanelOpen }));
    },

    toggleRightPanel: () => {
      set((state) => ({ rightPanelOpen: !state.rightPanelOpen }));
    },

    setRightPanelTab: (tab) => {
      set({ rightPanelTab: tab });
    },

    exportData: () => {
      return exportToJSON(get());
    },

    importData: (json) => {
      const imported = importFromJSON(json);
      set((state) => {
        const merged = { ...state, ...imported };
        return { ...merged, ...checkRules(merged) };
      });
    },

    clearAll: () => {
      set({
        characters: [],
        events: [],
        locations: [],
        clues: [],
        hypotheses: [],
        evidences: [],
        relations: [],
        selectedEntityId: null,
        selectedEntityType: null,
        violations: [],
      });
    },
  };
});

export const getEntityById = (id: string, type: EntityType) => {
  const state = useBoardStore.getState();
  switch (type) {
    case 'character':
      return state.characters.find((e) => e.id === id);
    case 'event':
      return state.events.find((e) => e.id === id);
    case 'location':
      return state.locations.find((e) => e.id === id);
    case 'clue':
      return state.clues.find((e) => e.id === id);
    case 'hypothesis':
      return state.hypotheses.find((e) => e.id === id);
  }
};
