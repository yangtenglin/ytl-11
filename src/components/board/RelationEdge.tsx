import type { Relation, AnyEntity, EntityType } from '@/types';
import { useBoardStore } from '@/store/useBoardStore';
import { useState } from 'react';

interface RelationEdgeProps {
  relation: Relation;
  onEdit: (relation: Relation) => void;
}

const NODE_WIDTH = 170;
const NODE_HEIGHT = 90;

export const RelationEdge = ({ relation, onEdit }: RelationEdgeProps) => {
  const { characters, events, locations, clues } = useBoardStore();
  const [isHovered, setIsHovered] = useState(false);

  const findEntity = (id: string, type: EntityType): AnyEntity | undefined => {
    switch (type) {
      case 'character':
        return characters.find((c) => c.id === id);
      case 'event':
        return events.find((e) => e.id === id);
      case 'location':
        return locations.find((l) => l.id === id);
      case 'clue':
        return clues.find((c) => c.id === id);
    }
  };

  const source = findEntity(relation.sourceId, relation.sourceType);
  const target = findEntity(relation.targetId, relation.targetType);

  if (!source?.position || !target?.position) return null;

  const x1 = source.position.x + NODE_WIDTH / 2;
  const y1 = source.position.y + NODE_HEIGHT / 2;
  const x2 = target.position.x + NODE_WIDTH / 2;
  const y2 = target.position.y + NODE_HEIGHT / 2;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curveOffset = Math.min(dist * 0.15, 50);
  const perpX = -dy / dist;
  const perpY = dx / dist;

  const ctrlX = midX + perpX * curveOffset;
  const ctrlY = midY + perpY * curveOffset;

  const getColor = () => {
    const map: Record<string, string> = {
      family: '#8b2c3e',
      professional: '#3a5a40',
      friend: '#c9a227',
      enemy: '#8b2c3e',
      romantic: '#a33d52',
      evidence: '#5c4d7d',
      causal: '#7c552b',
      location: '#2d5a7b',
      other: '#7c6850',
    };
    return map[relation.relationType] || '#7c6850';
  };

  const color = getColor();
  const labelX = ctrlX;
  const labelY = ctrlY;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(relation)}
      style={{ cursor: 'pointer' }}
    >
      <path
        d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
        stroke={color}
        strokeWidth={isHovered ? 3.5 : 2}
        fill="none"
        opacity={isHovered ? 1 : 0.75}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
        stroke="transparent"
        strokeWidth={14}
        fill="none"
      />
      <polygon
        points={`0,-5 10,0 0,5`}
        fill={color}
        transform={`translate(${x2 - 8}, ${y2}) rotate(${Math.atan2(y2 - ctrlY, x2 - ctrlX) * 180 / Math.PI})`}
        opacity={isHovered ? 1 : 0.85}
      />
      {(isHovered || relation.label.length <= 6) && (
        <>
          <rect
            x={labelX - relation.label.length * 7 - 8}
            y={labelY - 11}
            width={relation.label.length * 14 + 16}
            height={22}
            rx={4}
            fill="#f4e8d0"
            stroke={color}
            strokeWidth={1}
            opacity={isHovered ? 1 : 0.92}
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            className="font-body select-none"
            fontSize={11}
            fill="#372f27"
          >
            {relation.label}
          </text>
        </>
      )}
    </g>
  );
};
