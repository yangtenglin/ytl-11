import type { DetectiveBoardState } from '@/types';

export const exportToJSON = (state: DetectiveBoardState): string => {
  const data = {
    characters: state.characters,
    events: state.events,
    locations: state.locations,
    clues: state.clues,
    relations: state.relations,
    zoom: state.zoom,
    pan: state.pan,
    exportedAt: new Date().toISOString(),
    version: '1.0',
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
    relations: data.relations || [],
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
