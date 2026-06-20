import type { Character, EventEntity, Location, Clue, Relation } from '@/types';
import { generateId, now } from '@/utils/idGenerator';

export const createMockData = (): {
  characters: Character[];
  events: EventEntity[];
  locations: Location[];
  clues: Clue[];
  relations: Relation[];
} => {
  const t = now();
  const id1 = generateId();
  const id2 = generateId();
  const id3 = generateId();
  const id4 = generateId();
  const id5 = generateId();

  const loc1 = generateId();
  const loc2 = generateId();
  const loc3 = generateId();

  const ev1 = generateId();
  const ev2 = generateId();
  const ev3 = generateId();

  const cl1 = generateId();
  const cl2 = generateId();
  const cl3 = generateId();

  const characters: Character[] = [
    {
      id: id1,
      type: 'character',
      name: '陈思远',
      alias: '陈侦探',
      role: '私家侦探',
      description: '前刑警队骨干，因不满体制内束缚辞职开设私家侦探所。性格沉稳，观察力敏锐，擅长从细微处发现线索。',
      avatarColor: '#3a5a40',
      notes: '主角。不喝酒，只喝黑咖啡。左手无名指有旧伤。',
      position: { x: 120, y: 200 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: id2,
      type: 'character',
      name: '林雨萱',
      alias: '林小姐',
      role: '富家千金',
      description: '林氏集团董事长独女，海外留学归来，接手家族企业。表面温婉实则极有主见。',
      avatarColor: '#8b2c3e',
      notes: '案件委托人。',
      position: { x: 420, y: 120 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: id3,
      type: 'character',
      name: '赵德海',
      alias: '赵管家',
      role: '林家管家',
      description: '在林家服务三十年，从林董事长年轻时便跟随左右。对林家忠心耿耿但似乎藏有秘密。',
      avatarColor: '#c9a227',
      notes: '',
      position: { x: 720, y: 180 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: id4,
      type: 'character',
      name: '周启明',
      role: '公司副总',
      description: '林氏集团元老，跟随林董事长创业的老部下。近来与林小姐在公司经营方向上多有分歧。',
      avatarColor: '#5c4d7d',
      notes: '',
      position: { x: 560, y: 420 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: id5,
      type: 'character',
      name: '苏雅琴',
      role: '私人秘书',
      description: '林董事长的私人秘书，年轻貌美，工作能力强，与周启明关系密切。',
      avatarColor: '#2d5a7b',
      notes: '孤立角色，暂未建立关系',
      position: { x: 120, y: 450 },
      createdAt: t,
      updatedAt: t,
    },
  ];

  const locations: Location[] = [
    {
      id: loc1,
      type: 'location',
      name: '林家老宅',
      locationType: '住宅',
      description: '位于市郊半山腰的独栋别墅，林宅已有百年历史，林家长期居住于此。',
      position: { x: 880, y: 340 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: loc2,
      type: 'location',
      name: '林氏集团总部',
      locationType: '公司',
      description: '市中心的摩天大楼顶层，林氏集团总部办公地。',
      position: { x: 280, y: 600 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: loc3,
      type: 'location',
      name: '蓝月酒店',
      locationType: '酒店',
      description: '五星级商务酒店，经常举办高端商务活动。',
      position: { x: 880, y: 540 },
      createdAt: t,
      updatedAt: t,
    },
  ];

  const events: EventEntity[] = [
    {
      id: ev1,
      type: 'event',
      title: '林董事长失踪',
      description: '林董事长在家中书房内突然失踪，房门反锁，室内无打斗痕迹。',
      timestamp: '2024-03-15T22:00:00Z',
      locationId: loc1,
      importance: 'critical',
      participantIds: [id1, id2, id3],
      position: { x: 300, y: 320 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: ev2,
      type: 'event',
      title: '董事会紧急会议',
      description: '因董事长失踪后紧急召开的董事会，讨论临时负责人人选产生激烈争论。',
      timestamp: '2024-03-16T10:00:00Z',
      locationId: loc2,
      importance: 'high',
      participantIds: [id2, id4],
      position: { x: 600, y: 260 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: ev3,
      type: 'event',
      title: '慈善晚宴',
      description: '蓝月酒店举办的年度慈善晚宴，失踪前林董事长出席。',
      timestamp: '2024-03-15T19:00:00Z',
      locationId: loc3,
      importance: 'medium',
      participantIds: [id2, id3, id4],
      position: { x: 760, y: 460 },
      createdAt: t,
      updatedAt: t,
    },
  ];

  const clues: Clue[] = [
    {
      id: cl1,
      type: 'clue',
      title: '破碎的茶杯',
      description: '书房地毯下发现一个青花瓷茶杯碎片，茶水尚有余温。',
      clueType: 'physical',
      eventId: ev1,
      locationId: loc1,
      characterId: id3,
      isExplained: false,
      position: { x: 200, y: 380 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: cl2,
      type: 'clue',
      title: '匿名信件',
      description: '保险柜中发现的一封未署名的威胁信。',
      clueType: 'document',
      eventId: ev1,
      isExplained: true,
      explanation: '经鉴定为周启明所写，但内容似乎另有隐情。',
      position: { x: 480, y: 200 },
      createdAt: t,
      updatedAt: t,
    },
    {
      id: cl3,
      type: 'clue',
      title: '监控盲区',
      description: '林家老宅案发当晚有十分钟的监控录像缺失。',
      clueType: 'digital',
      eventId: ev1,
      locationId: loc1,
      isExplained: false,
      position: { x: 820, y: 280 },
      createdAt: t,
      updatedAt: t,
    },
  ];

  const relations: Relation[] = [
    {
      id: generateId(),
      sourceId: id1,
      sourceType: 'character',
      targetId: id2,
      targetType: 'character',
      relationType: 'professional',
      label: '受托调查',
      description: '林雨萱委托陈思远调查父亲失踪案',
      createdAt: t,
    },
    {
      id: generateId(),
      sourceId: id2,
      sourceType: 'character',
      targetId: id3,
      targetType: 'character',
      relationType: 'family',
      label: '主仆',
      description: '赵管家看着林雨萱长大',
      createdAt: t,
    },
    {
      id: generateId(),
      sourceId: id2,
      sourceType: 'character',
      targetId: id4,
      targetType: 'character',
      relationType: 'professional',
      label: '上下级',
      description: '周启明是林雨萱的下属，两人关系紧张',
      createdAt: t,
    },
    {
      id: generateId(),
      sourceId: ev1,
      sourceType: 'event',
      targetId: loc1,
      targetType: 'location',
      relationType: 'location',
      label: '发生地',
      description: '林董事长失踪事件发生在林家老宅',
      createdAt: t,
    },
    {
      id: generateId(),
      sourceId: ev2,
      sourceType: 'event',
      targetId: ev1,
      targetType: 'event',
      relationType: 'causal',
      label: '后续事件',
      description: '',
      createdAt: t,
    },
    {
      id: generateId(),
      sourceId: cl1,
      sourceType: 'clue',
      targetId: ev1,
      targetType: 'event',
      relationType: 'evidence',
      label: '现场发现',
      description: '',
      createdAt: t,
    },
  ];

  return { characters, events, locations, clues, relations };
};
