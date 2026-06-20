import { useRef, useState, useEffect } from 'react';
import { User, Calendar, MapPin, Search, Edit3, Link as LinkIcon } from 'lucide-react';
import type { AnyEntity, EntityType } from '@/types';
import { useBoardStore } from '@/store/useBoardStore';
import {
  importanceColors,
  clueTypeLabels,
} from '@/utils/idGenerator';
import { cn } from '@/lib/utils';

interface EntityNodeProps {
  entity: AnyEntity;
  onEdit: (id: string, type: EntityType) => void;
  onRelationEditor: (sourceId: string, sourceType: EntityType) => void;
}

const iconMap: Record<EntityType, typeof User> = {
  character: User,
  event: Calendar,
  location: MapPin,
  clue: Search,
};

const cardStyles: Record<EntityType, string> = {
  character: 'bg-parchment-100 border-accent-green',
  event: 'bg-parchment-100 border-accent-gold',
  location: 'bg-parchment-100 border-accent-red',
  clue: 'bg-parchment-100 border-ink-600',
};

const iconBgStyles: Record<EntityType, string> = {
  character: 'bg-accent-green/20 text-accent-green',
  event: 'bg-accent-gold/20 text-accent-gold',
  location: 'bg-accent-red/20 text-accent-red',
  clue: 'bg-ink-600/20 text-ink-600',
};

export const EntityNode = ({ entity, onEdit, onRelationEditor }: EntityNodeProps) => {
  const {
    selectEntity,
    selectedEntityId,
    updateEntityPosition,
    isCreatingRelation,
    relationSource,
    addRelation,
    zoom,
  } = useBoardStore();

  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isSelected = selectedEntityId === entity.id;
  const Icon = iconMap[entity.type];

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!nodeRef.current?.parentElement) return;
      const parent = nodeRef.current.parentElement;
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / zoom;
      const y = (e.clientY - rect.top - dragOffset.y) / zoom;
      updateEntityPosition(entity.id, entity.type, { x: Math.max(0, x), y: Math.max(0, y) });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoom, entity.id, entity.type, updateEntityPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    setIsDragging(true);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const parentRect = nodeRef.current.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setDragOffset({
          x: (e.clientX - rect.left),
          y: (e.clientY - rect.top),
        });
      }
    }
    selectEntity(entity.id, entity.type);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    selectEntity(entity.id, entity.type);

    if (isCreatingRelation && relationSource && relationSource.id !== entity.id) {
      if (confirm(`建立与该实体的关系？`)) {
        onRelationEditor(relationSource.id, relationSource.type);
      }
    }
  };

  const getTitle = () => {
    switch (entity.type) {
      case 'character':
        return entity.name;
      case 'event':
        return entity.title;
      case 'location':
        return entity.name;
      case 'clue':
        return entity.title;
    }
  };

  const renderBadge = () => {
    switch (entity.type) {
      case 'character':
        return (
          <span
            className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white shadow-pin"
            style={{ backgroundColor: entity.avatarColor }}
          />
        );
      case 'event':
        return (
          <span
            className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white shadow-pin flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: importanceColors[entity.importance] }}
          >
            !
          </span>
        );
      case 'location':
        return (
          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white shadow-pin bg-accent-red flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </span>
        );
      case 'clue':
        return (
          <span
            className={cn(
              'absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white shadow-pin flex items-center justify-center',
              entity.isExplained ? 'bg-accent-green' : 'bg-accent-red'
            )}
          >
            <Search size={12} className="text-white" />
          </span>
        );
    }
  };

  const renderSubInfo = () => {
    switch (entity.type) {
      case 'character':
        return entity.role ? <div className="text-[10px] text-ink-500 font-body">{entity.role}</div> : null;
      case 'event':
        return entity.timestamp ? (
          <div className="text-[10px] text-ink-500 font-body truncate">
            {new Date(entity.timestamp).toLocaleDateString('zh-CN')}
          </div>
        ) : null;
      case 'location':
        return entity.locationType ? (
          <div className="text-[10px] text-ink-500 font-body">{entity.locationType}</div>
        ) : null;
      case 'clue':
        return (
          <div className="text-[10px] text-ink-500 font-body">
            {clueTypeLabels[entity.clueType]}
            {!entity.isExplained && <span className="text-accent-red ml-1">·待解释</span>}
          </div>
        );
    }
  };

  const width = entity.type === 'character' ? 160 : entity.type === 'event' ? 180 : 160;

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: entity.position?.x ?? 100,
        top: entity.position?.y ?? 100,
        width,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 20 : isDragging ? 15 : 10,
      }}
      className={cn(
        'bg-paper-texture rounded-md border-2 shadow-paper transition-all duration-200 group animate-float-in',
        cardStyles[entity.type],
        isSelected && 'ring-2 ring-accent-gold ring-offset-2 ring-offset-cork-700 shadow-paper-hover -translate-y-0.5',
        isDragging && 'shadow-paper-hover scale-105',
        isCreatingRelation && relationSource?.id !== entity.id && 'hover:ring-2 hover:ring-accent-gold/60'
      )}
    >
      {renderBadge()}

      <div className="p-2.5 pt-2">
        <div className="flex items-start gap-1.5">
          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', iconBgStyles[entity.type])}>
            <Icon size={12} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm text-ink-800 leading-tight truncate">
              {getTitle()}
            </div>
            {renderSubInfo()}
          </div>
        </div>
        {entity.description && (
          <p className="text-[10px] text-ink-600 font-body mt-1.5 line-clamp-2 leading-snug">
            {entity.description}
          </p>
        )}
      </div>

      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRelationEditor(entity.id, entity.type);
          }}
          className="p-0.5 rounded hover:bg-cork-200 text-ink-400 hover:text-accent-gold transition-colors"
          title="建立关系"
        >
          <LinkIcon size={11} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(entity.id, entity.type);
          }}
          className="p-0.5 rounded hover:bg-cork-200 text-ink-400 hover:text-ink-700 transition-colors"
          title="编辑"
        >
          <Edit3 size={11} />
        </button>
      </div>
    </div>
  );
};
