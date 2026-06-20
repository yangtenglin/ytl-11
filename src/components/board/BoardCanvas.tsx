import { useRef, useState, useEffect } from 'react';
import { EntityNode } from './EntityNode';
import { RelationEdge } from './RelationEdge';
import { EntityEditorModal } from '@/components/sidebar/EntityEditorModal';
import { RelationEditorModal } from './RelationEditorModal';
import { useBoardStore } from '@/store/useBoardStore';
import { X } from 'lucide-react';
import type { EntityType, Relation } from '@/types';

export const BoardCanvas = () => {
  const {
    characters,
    events,
    locations,
    clues,
    relations,
    zoom,
    pan,
    setZoom,
    setPan,
    selectEntity,
    selectedEntityId,
    isCreatingRelation,
    cancelRelationCreation,
    relationSource,
    timeRangeFilter,
  } = useBoardStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editEntityId, setEditEntityId] = useState<string | null>(null);
  const [editType, setEditType] = useState<EntityType>('character');
  const [relEditorOpen, setRelEditorOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
  const [relSource, setRelSource] = useState<{ id: string; type: EntityType } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const eventsFiltered = events.filter((e) => {
    if (!e.timestamp) return true;
    const t = new Date(e.timestamp).getTime();
    if (timeRangeFilter.start && t < new Date(timeRangeFilter.start).getTime()) return false;
    if (timeRangeFilter.end && t > new Date(timeRangeFilter.end).getTime()) return false;
    return true;
  });

  const inTimeRange = (id: string, type: EntityType): boolean => {
    if (type !== 'event') return true;
    return eventsFiltered.some((e) => e.id === id);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!canvasRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoom, setZoom]);

  useEffect(() => {
    if (!isPanning) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPan({ x: pan.x + (e.clientX - panStart.x), y: pan.y + (e.clientY - panStart.y) });
      setPanStart({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, pan, setPan]);

  useEffect(() => {
    if (!isCreatingRelation) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCreatingRelation, pan, zoom]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('canvas-bg')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    selectEntity(null, null);
  };

  const handleEdit = (id: string, type: EntityType) => {
    setEditEntityId(id);
    setEditType(type);
    setEditorOpen(true);
  };

  const handleRelationEditor = (sourceId: string, sourceType: EntityType) => {
    setRelSource({ id: sourceId, type: sourceType });
    setEditingRelation(null);
    setRelEditorOpen(true);
    cancelRelationCreation();
  };

  const handleRelationEdit = (relation: Relation) => {
    setEditingRelation(relation);
    setRelSource(null);
    setRelEditorOpen(true);
  };

  const allEntities = [
    ...characters.map((c) => ({ ...c, type: 'character' as const })),
    ...eventsFiltered.map((e) => ({ ...e, type: 'event' as const })),
    ...locations.map((l) => ({ ...l, type: 'location' as const })),
    ...clues.map((c) => ({ ...c, type: 'clue' as const })),
  ];

  const getSourcePos = () => {
    if (!relationSource) return null;
    const src = allEntities.find((e) => e.id === relationSource.id);
    if (!src?.position) return null;
    return { x: src.position.x + 85, y: src.position.y + 45 };
  };

  const sourcePos = getSourcePos();

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-cork-900 bg-cork-texture"
      onMouseDown={handleCanvasMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : isCreatingRelation ? 'crosshair' : 'grab' }}
    >
      {isCreatingRelation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-accent-gold text-ink-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-display text-sm animate-pulse-glow">
          <span>点击另一个实体建立关系...</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cancelRelationCreation();
            }}
            className="p-0.5 rounded-full hover:bg-ink-900/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="canvas-bg absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '4000px',
          height: '3000px',
        }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #c9a227 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          style={{ zIndex: 1 }}
        >
          {relations.map((rel) => {
            const srcVisible = inTimeRange(rel.sourceId, rel.sourceType);
            const tgtVisible = inTimeRange(rel.targetId, rel.targetType);
            if (!srcVisible || !tgtVisible) return null;
            return <RelationEdge key={rel.id} relation={rel} onEdit={handleRelationEdit} />;
          })}

          {isCreatingRelation && sourcePos && mousePos && (
            <line
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#8b2c3e"
              strokeWidth={2.5}
              strokeDasharray="8 4"
              opacity={0.8}
            />
          )}
        </svg>

        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 2 }}>
          {allEntities.map((entity) => (
            <EntityNode
              key={`${entity.type}-${entity.id}`}
              entity={entity}
              onEdit={handleEdit}
              onRelationEditor={handleRelationEditor}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 bg-cork-900/80 backdrop-blur-sm border border-cork-700 rounded-lg px-3 py-1.5 text-parchment-200 text-xs font-body">
        缩放: {Math.round(zoom * 100)}% · 滚轮缩放 · 空白拖拽平移
      </div>

      <EntityEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        entityType={editType}
        entityId={editEntityId}
      />

      <RelationEditorModal
        isOpen={relEditorOpen}
        onClose={() => {
          setRelEditorOpen(false);
          setEditingRelation(null);
          setRelSource(null);
        }}
        sourceId={relSource?.id}
        sourceType={relSource?.type}
        editingRelation={editingRelation}
      />
    </div>
  );
};
