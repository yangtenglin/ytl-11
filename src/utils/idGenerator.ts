export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const now = (): string => new Date().toISOString();

export const formatDate = (timestamp: string): string => {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

export const formatShortDate = (timestamp: string): string => {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const entityTypeLabels: Record<string, string> = {
  character: '人物',
  event: '事件',
  location: '地点',
  clue: '线索',
  hypothesis: '假设',
};

export const hypothesisStatusLabels: Record<string, string> = {
  pending: '待验证',
  verified: '已成立',
  rejected: '已否决',
};

export const evidenceTypeLabels: Record<string, string> = {
  supporting: '支持证据',
  refuting: '反驳证据',
};

export const clueTypeLabels: Record<string, string> = {
  physical: '物证',
  testimony: '证词',
  document: '文书',
  digital: '数字',
  other: '其他',
};

export const importanceLabels: Record<string, string> = {
  low: '次要',
  medium: '一般',
  high: '重要',
  critical: '关键',
};

export const importanceColors: Record<string, string> = {
  low: '#7c6850',
  medium: '#c9a227',
  high: '#a33d52',
  critical: '#8b2c3e',
};

export const avatarColors = [
  '#8b2c3e', '#3a5a40', '#c9a227', '#5c4d7d',
  '#2d5a7b', '#7c552b', '#a33d52', '#4d7352',
  '#6b3a5a', '#3a6b7c',
];

export const getRandomColor = (): string => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};
