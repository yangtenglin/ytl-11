import { create } from 'zustand';
import type {
  BoardStore,
  Character,
  EventEntity,
  Location,
  Clue,
  Relation,
  EntityType,
} from '@/types';
import { generateId, now, clamp } from '@/utils/idGenerator';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';
import { useRulesEngine } from '@/hooks/useRulesEngine';
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

  return {
    characters: mockData.characters,
    events: mockData.events,
    locations: mockData.locations,
    clues: mockData.clues,
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

    addCharacter: (data) => {
      const char: Character = {
        ...data,
        id: generateId(),
        type: 'character',
        createdAt: now(),
        updatedAt: now(),
      };
      const newCharacters = [...get().characters, char];
      set((state) => ({ characters: newCharacters, ...checkRules({ characters: newCharacters }) }));
    },

    updateCharacter: (id, data) => {
      set((state) => {
        const updated = state.characters.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: now() } : c
        );
        return { characters: updated, ...checkRules({ characters: updated }) };
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
        const partial = {
          characters: newChars,
          relations: newRelations,
          events: newEvents,
          clues: newClues,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
        return { ...partial, ...checkRules(partial) };
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
        return { events: newEvents, ...checkRules({ events: newEvents }) };
      });
    },

    updateEvent: (id, data) => {
      set((state) => {
        const updated = state.events.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: now() } : e
        );
        return { events: updated, ...checkRules({ events: updated }) };
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
        return { ...partial, ...checkRules(partial) };
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
        return { clues: newClues, ...checkRules({ clues: newClues }) };
      });
    },

    updateClue: (id, data) => {
      set((state) => {
        const updated = state.clues.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: now() } : c
        );
        return { clues: updated, ...checkRules({ clues: updated }) };
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
        const partial = {
          clues: newClues,
          relations: newRelations,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        };
        return { ...partial, ...checkRules(partial) };
      });
    },

    addRelation: (data) => {
      const rel: Relation = {
        ...data,
        id: generateId(),
        createdAt: now(),
      };
      set((state) => ({
        relations: [...state.relations, rel],
        isCreatingRelation: false,
        relationSource: null,
      }));
    },

    updateRelation: (id, data) => {
      set((state) => ({
        relations: state.relations.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      }));
    },

    deleteRelation: (id) => {
      set((state) => ({ relations: state.relations.filter((r) => r.id !== id) }));
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

    toggleLeftPanel: () => {
      set((state) => ({ leftPanelOpen: !state.leftPanelOpen }));
    },

    toggleRightPanel: () => {
      set((state) => ({ rightPanelOpen: !state.rightPanelOpen }));
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
  }
};
