import { useState } from 'react';
import { User, Calendar, MapPin, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { EntityCard } from './EntityCard';
import { EntityEditorModal } from './EntityEditorModal';
import { useBoardStore } from '@/store/useBoardStore';
import { cn } from '@/lib/utils';
import { entityTypeLabels } from '@/utils/idGenerator';
import type { EntityType } from '@/types';

const tabs: { type: EntityType; icon: typeof User; label: string }[] = [
  { type: 'character', icon: User, label: '人物' },
  { type: 'event', icon: Calendar, label: '事件' },
  { type: 'location', icon: MapPin, label: '地点' },
  { type: 'clue', icon: Search, label: '线索' },
];

export const EntityListPanel = () => {
  const { characters, events, locations, clues, leftPanelOpen, toggleLeftPanel } = useBoardStore();
  const [activeTab, setActiveTab] = useState<EntityType>('character');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editEntityId, setEditEntityId] = useState<string | null>(null);
  const [editType, setEditType] = useState<EntityType>('character');

  const entities = {
    character: characters,
    event: events,
    location: locations,
    clue: clues,
  };

  const countMap = {
    character: characters.length,
    event: events.length,
    location: locations.length,
    clue: clues.length,
  };

  const handleNew = () => {
    setEditEntityId(null);
    setEditType(activeTab);
    setEditorOpen(true);
  };

  const handleEdit = (id: string, type: EntityType) => {
    setEditEntityId(id);
    setEditType(type);
    setEditorOpen(true);
  };

  if (!leftPanelOpen) {
    return (
      <button
        onClick={toggleLeftPanel}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-cork-800 text-parchment-200 px-1.5 py-6 rounded-r-md shadow-lg hover:bg-cork-700 transition-colors flex items-center"
      >
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <>
      <div className="w-72 h-full flex flex-col bg-cork-100 border-r-2 border-cork-400 shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-cork-300 bg-parchment-100/80">
          <h2 className="font-display text-sm text-ink-800 tracking-wide">档案管理</h2>
          <button
            onClick={toggleLeftPanel}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex border-b border-cork-300 bg-parchment-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all relative',
                  isActive
                    ? 'text-ink-800 bg-parchment-100'
                    : 'text-ink-500 hover:text-ink-700 hover:bg-cork-100'
                )}
              >
                <Icon size={16} />
                <span className="text-[10px] font-display">{tab.label}</span>
                <span
                  className={cn(
                    'absolute top-1 right-1 min-w-[16px] h-4 rounded-full text-[10px] font-body flex items-center justify-center',
                    isActive ? 'bg-accent-gold text-ink-900' : 'bg-cork-300 text-ink-700'
                  )}
                >
                  {countMap[tab.type]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-gold rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 border-b border-cork-300 bg-parchment-50/50">
          <button
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-accent-gold/90 hover:bg-accent-gold text-ink-900 font-display text-sm shadow-md transition-all hover:shadow-lg"
          >
            <Plus size={16} />
            新建{entityTypeLabels[activeTab]}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {entities[activeTab].length === 0 ? (
            <div className="text-center py-12 text-ink-400">
              <div className="font-display text-sm mb-1">暂无{entityTypeLabels[activeTab]}</div>
              <div className="text-xs font-body">点击上方按钮创建第一个</div>
            </div>
          ) : (
            entities[activeTab].map((entity) => (
              <EntityCard key={entity.id} entity={entity} onEdit={handleEdit} />
            ))
          )}
        </div>
      </div>

      <EntityEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        entityType={editType}
        entityId={editEntityId}
      />
    </>
  );
};
