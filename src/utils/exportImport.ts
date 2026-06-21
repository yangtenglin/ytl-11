import type { DetectiveBoardState } from '@/types';

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
    version: '1.1',
  };
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = (json: string): Partial<DetectiveBoardState> => {
  const data = JSON.parse(json);
  return {
    characters: data.characters || [],
    events: data.events || [],
    locations: data.locations || [],
    clues: data.clues || [],
    hypotheses: data.hypotheses || [],
    evidences: data.evidences || [],
    relations: data.relations || [],
    commuteTimes: data.commuteTimes || [],
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
