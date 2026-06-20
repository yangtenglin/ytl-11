import { useState, useEffect } from 'react';
import { X, Save, User, Calendar, MapPin, Search } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton';
import { useBoardStore } from '@/store/useBoardStore';
import {
  clueTypeLabels,
  importanceLabels,
  getRandomColor,
  avatarColors,
} from '@/utils/idGenerator';
import { cn } from '@/lib/utils';
import type { EntityType, Character, EventEntity, Location, Clue } from '@/types';

interface EntityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId?: string | null;
}

export const EntityEditorModal = ({
  isOpen,
  onClose,
  entityType,
  entityId,
}: EntityEditorModalProps) => {
  const {
    characters,
    events,
    locations,
    clues,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addEvent,
    updateEvent,
    deleteEvent,
    addLocation,
    updateLocation,
    deleteLocation,
    addClue,
    updateClue,
    deleteClue,
  } = useBoardStore();

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const isEdit = Boolean(entityId);

  useEffect(() => {
    if (!isOpen) return;

    let initial: Record<string, unknown> = {};
    switch (entityType) {
      case 'character': {
        const existing = entityId
          ? (characters.find((c) => c.id === entityId) as Character)
          : null;
        initial = existing
          ? { ...existing }
          : {
              name: '',
              alias: '',
              role: '',
              description: '',
              avatarColor: getRandomColor(),
              notes: '',
            };
        break;
      }
      case 'event': {
        const existing = entityId
          ? (events.find((e) => e.id === entityId) as EventEntity)
          : null;
        initial = existing
          ? { ...existing }
          : {
              title: '',
              description: '',
              timestamp: new Date().toISOString().slice(0, 16),
              locationId: '',
              importance: 'medium' as const,
              participantIds: [] as string[],
            };
        break;
      }
      case 'location': {
        const existing = entityId
          ? (locations.find((l) => l.id === entityId) as Location)
          : null;
        initial = existing
          ? { ...existing }
          : { name: '', locationType: '', description: '' };
        break;
      }
      case 'clue': {
        const existing = entityId
          ? (clues.find((c) => c.id === entityId) as Clue)
          : null;
        initial = existing
          ? { ...existing }
          : {
              title: '',
              description: '',
              clueType: 'physical' as const,
              eventId: '',
              characterId: '',
              locationId: '',
              isExplained: false,
              explanation: '',
            };
        break;
      }
    }
    setFormData(initial);
  }, [isOpen, entityType, entityId, characters, events, locations, clues]);

  if (!isOpen) return null;

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const data = { ...formData };
    if (!data.position) {
      data.position = {
        x: 200 + Math.random() * 500,
        y: 150 + Math.random() * 300,
      };
    }

    switch (entityType) {
      case 'character':
        if (isEdit && entityId) {
          updateCharacter(entityId, data as Partial<Character>);
        } else {
          addCharacter(data as Omit<Character, 'id' | 'type' | 'createdAt' | 'updatedAt'>);
        }
        break;
      case 'event':
        if (isEdit && entityId) {
          updateEvent(entityId, data as Partial<EventEntity>);
        } else {
          addEvent(data as Omit<EventEntity, 'id' | 'type' | 'createdAt' | 'updatedAt'>);
        }
        break;
      case 'location':
        if (isEdit && entityId) {
          updateLocation(entityId, data as Partial<Location>);
        } else {
          addLocation(data as Omit<Location, 'id' | 'type' | 'createdAt' | 'updatedAt'>);
        }
        break;
      case 'clue':
        if (isEdit && entityId) {
          updateClue(entityId, data as Partial<Clue>);
        } else {
          addClue(data as Omit<Clue, 'id' | 'type' | 'createdAt' | 'updatedAt'>);
        }
        break;
    }
    onClose();
  };

  const handleDelete = () => {
    if (!entityId || !confirm('确定要删除吗？相关的关系也将被移除。')) return;
    switch (entityType) {
      case 'character':
        deleteCharacter(entityId);
        break;
      case 'event':
        deleteEvent(entityId);
        break;
      case 'location':
        deleteLocation(entityId);
        break;
      case 'clue':
        deleteClue(entityId);
        break;
    }
    onClose();
  };

  const iconMap: Record<EntityType, typeof User> = {
    character: User,
    event: Calendar,
    location: MapPin,
    clue: Search,
  };
  const titleMap: Record<EntityType, string> = {
    character: isEdit ? '编辑人物' : '新建人物',
    event: isEdit ? '编辑事件' : '新建事件',
    location: isEdit ? '编辑地点' : '新建地点',
    clue: isEdit ? '编辑线索' : '新建线索',
  };
  const Icon = iconMap[entityType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-paper-texture bg-parchment-50 w-[560px] max-h-[85vh] rounded-lg shadow-paper-hover border border-cork-300 flex flex-col overflow-hidden animate-drop">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cork-300 bg-parchment-100/80">
          <div className="flex items-center gap-2">
            <Icon className="text-accent-red" size={20} />
            <h2 className="font-display text-lg text-ink-800">{titleMap[entityType]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-ink-200/50 text-ink-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {entityType === 'character' && (
            <>
              <Field label="姓名" required>
                <input
                  type="text"
                  value={(formData.name as string) || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                  placeholder="输入人物姓名"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="别名">
                  <input
                    type="text"
                    value={(formData.alias as string) || ''}
                    onChange={(e) => updateField('alias', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="身份/职业">
                  <input
                    type="text"
                    value={(formData.role as string) || ''}
                    onChange={(e) => updateField('role', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="头像颜色">
                <div className="flex flex-wrap gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateField('avatarColor', color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        formData.avatarColor === color
                          ? 'border-accent-gold ring-2 ring-accent-gold/40 scale-110'
                          : 'border-ink-300'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </Field>
              <Field label="人物描述">
                <textarea
                  value={(formData.description as string) || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={cn(inputClass, 'min-h-[90px] resize-y')}
                  placeholder="描述人物的外貌、性格、背景故事等..."
                />
              </Field>
              <Field label="创作笔记">
                <textarea
                  value={(formData.notes as string) || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className={cn(inputClass, 'min-h-[60px] resize-y')}
                  placeholder="自己的创作想法、伏笔设置等..."
                />
              </Field>
            </>
          )}

          {entityType === 'event' && (
            <>
              <Field label="事件标题" required>
                <input
                  type="text"
                  value={(formData.title as string) || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={inputClass}
                  placeholder="简洁描述事件"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="时间">
                  <input
                    type="datetime-local"
                    value={(formData.timestamp as string) || ''}
                    onChange={(e) => updateField('timestamp', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="重要程度">
                  <select
                    value={(formData.importance as string) || 'medium'}
                    onChange={(e) => updateField('importance', e.target.value)}
                    className={inputClass}
                  >
                    {Object.entries(importanceLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="发生地点">
                <select
                  value={(formData.locationId as string) || ''}
                  onChange={(e) => updateField('locationId', e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- 未指定 --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="参与人物">
                <div className="flex flex-wrap gap-2 border border-cork-300 rounded-md p-2 bg-white/50 min-h-[44px]">
                  {characters.length === 0 ? (
                    <span className="text-ink-400 text-sm italic">请先创建人物</span>
                  ) : (
                    characters.map((c) => {
                      const selected = (formData.participantIds as string[])?.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            const ids = (formData.participantIds as string[]) || [];
                            updateField(
                              'participantIds',
                              selected ? ids.filter((i) => i !== c.id) : [...ids, c.id]
                            );
                          }}
                          className={cn(
                            'px-2 py-1 rounded text-xs font-body border transition-all',
                            selected
                              ? 'bg-accent-gold/30 border-accent-gold text-ink-800'
                              : 'bg-white border-cork-300 text-ink-600 hover:bg-cork-100'
                          )}
                        >
                          {c.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </Field>
              <Field label="事件描述">
                <textarea
                  value={(formData.description as string) || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={cn(inputClass, 'min-h-[100px] resize-y')}
                  placeholder="详细描述事件经过..."
                />
              </Field>
            </>
          )}

          {entityType === 'location' && (
            <>
              <Field label="地点名称" required>
                <input
                  type="text"
                  value={(formData.name as string) || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                  placeholder="如：林家老宅"
                />
              </Field>
              <Field label="地点类型">
                <input
                  type="text"
                  value={(formData.locationType as string) || ''}
                  onChange={(e) => updateField('locationType', e.target.value)}
                  className={inputClass}
                  placeholder="如：住宅、公司、酒店..."
                />
              </Field>
              <Field label="地点描述">
                <textarea
                  value={(formData.description as string) || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={cn(inputClass, 'min-h-[100px] resize-y')}
                  placeholder="描述环境氛围、布局特点等..."
                />
              </Field>
            </>
          )}

          {entityType === 'clue' && (
            <>
              <Field label="线索标题" required>
                <input
                  type="text"
                  value={(formData.title as string) || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={inputClass}
                  placeholder="简洁描述线索"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="线索类型">
                  <select
                    value={(formData.clueType as string) || 'physical'}
                    onChange={(e) => updateField('clueType', e.target.value)}
                    className={inputClass}
                  >
                    {Object.entries(clueTypeLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="关联事件">
                  <select
                    value={(formData.eventId as string) || ''}
                    onChange={(e) => updateField('eventId', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- 未关联 --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="关联人物">
                  <select
                    value={(formData.characterId as string) || ''}
                    onChange={(e) => updateField('characterId', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- 未关联 --</option>
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="关联地点">
                  <select
                    value={(formData.locationId as string) || ''}
                    onChange={(e) => updateField('locationId', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- 未关联 --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="线索描述">
                <textarea
                  value={(formData.description as string) || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={cn(inputClass, 'min-h-[80px] resize-y')}
                  placeholder="详细描述线索内容、特征..."
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.isExplained as boolean) || false}
                  onChange={(e) => updateField('isExplained', e.target.checked)}
                  className="w-4 h-4 accent-accent-green"
                />
                <span className="font-body text-ink-700">该线索已得到解释</span>
              </label>
              {formData.isExplained && (
                <Field label="解释说明">
                  <textarea
                    value={(formData.explanation as string) || ''}
                    onChange={(e) => updateField('explanation', e.target.value)}
                    className={cn(inputClass, 'min-h-[60px] resize-y')}
                    placeholder="记录该线索的真相..."
                  />
                </Field>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-cork-300 bg-parchment-100/80">
          <div>
            {isEdit && (
              <IconButton variant="danger" size="sm" onClick={handleDelete}>
                删除
              </IconButton>
            )}
          </div>
          <div className="flex gap-2">
            <IconButton variant="secondary" size="sm" onClick={onClose}>
              取消
            </IconButton>
            <IconButton
              icon={<Save size={16} />}
              variant="primary"
              size="sm"
              onClick={handleSubmit}
            >
              {isEdit ? '保存修改' : '创建'}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputClass =
  'w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-display text-sm text-ink-700">
        {label}
        {required && <span className="text-accent-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
