import { User, Calendar, MapPin, Search, Edit3, Trash2, Link as LinkIcon } from 'lucide-react';
import type { AnyEntity, EntityType } from '@/types';
import { useBoardStore } from '@/store/useBoardStore';
import {
  entityTypeLabels,
  clueTypeLabels,
  importanceLabels,
  importanceColors,
  formatShortDate,
} from '@/utils/idGenerator';
import { cn } from '@/lib/utils';

interface EntityCardProps {
  entity: AnyEntity;
  onEdit: (id: string, type: EntityType) => void;
}

const iconMap: Record<EntityType, typeof User> = {
  character: User,
  event: Calendar,
  location: MapPin,
  clue: Search,
};

const typeColors: Record<EntityType, string> = {
  character: 'border-l-4 border-accent-green',
  event: 'border-l-4 border-accent-gold',
  location: 'border-l-4 border-accent-red',
  clue: 'border-l-4 border-ink-600',
};

export const EntityCard = ({ entity, onEdit }: EntityCardProps) => {
  const { selectEntity, selectedEntityId, startRelationCreation, deleteClue, deleteCharacter, deleteEvent, deleteLocation } =
    useBoardStore();
  const Icon = iconMap[entity.type];
  const isSelected = selectedEntityId === entity.id;

  const handleClick = () => {
    selectEntity(entity.id, entity.type);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(entity.id, entity.type);
  };

  const handleAddRelation = (e: React.MouseEvent) => {
    e.stopPropagation();
    startRelationCreation(entity.id, entity.type);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除吗？')) return;
    switch (entity.type) {
      case 'character':
        deleteCharacter(entity.id);
        break;
      case 'event':
        deleteEvent(entity.id);
        break;
      case 'location':
        deleteLocation(entity.id);
        break;
      case 'clue':
        deleteClue(entity.id);
        break;
    }
  };

  const renderMeta = () => {
    switch (entity.type) {
      case 'character':
        return (
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-3 h-3 rounded-full shadow-inner"
              style={{ backgroundColor: entity.avatarColor }}
            />
            <span className="text-xs text-ink-500 font-body">{entity.role || '未设定身份'}</span>
          </div>
        );
      case 'event':
        return (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-ink-500 font-body">{formatShortDate(entity.timestamp)}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-body text-parchment-50"
              style={{ backgroundColor: importanceColors[entity.importance] }}
            >
              {importanceLabels[entity.importance]}
            </span>
          </div>
        );
      case 'location':
        return entity.locationType ? (
          <div className="text-xs text-ink-500 font-body mt-1">{entity.locationType}</div>
        ) : null;
      case 'clue':
        return (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-ink-500 font-body">
              {clueTypeLabels[entity.clueType]}
            </span>
            {entity.isExplained ? (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green font-body">
                已解释
              </span>
            ) : (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red font-body">
                待解释
              </span>
            )}
          </div>
        );
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

  const getSubtitle = () => {
    switch (entity.type) {
      case 'character':
        return entity.alias;
      default:
        return undefined;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group bg-paper-texture bg-parchment-100 rounded-md p-3 cursor-pointer transition-all duration-200 shadow-paper hover:shadow-paper-hover border border-cork-300',
        typeColors[entity.type],
        isSelected && 'ring-2 ring-accent-gold ring-offset-2 ring-offset-cork-100 -translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
              entity.type === 'character' && 'bg-accent-green/20 text-accent-green',
              entity.type === 'event' && 'bg-accent-gold/20 text-accent-gold',
              entity.type === 'location' && 'bg-accent-red/20 text-accent-red',
              entity.type === 'clue' && 'bg-ink-600/20 text-ink-600'
            )}
          >
            <Icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm text-ink-800 truncate">{getTitle()}</div>
            {getSubtitle() && (
              <div className="text-xs text-ink-500 font-hand">{getSubtitle()}</div>
            )}
            {renderMeta()}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddRelation}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-gold transition-colors"
            title="建立关系"
          >
            <LinkIcon size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-ink-700 transition-colors"
            title="编辑"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-red transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {entity.description && (
        <p className="text-xs text-ink-600 font-body mt-2 line-clamp-2 leading-relaxed">
          {entity.description}
        </p>
      )}
    </div>
  );
};
