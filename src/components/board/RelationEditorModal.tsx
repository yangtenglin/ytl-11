import { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton';
import { useBoardStore } from '@/store/useBoardStore';
import type { EntityType, Relation } from '@/types';
import { entityTypeLabels } from '@/utils/idGenerator';

interface RelationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId?: string | null;
  sourceType?: EntityType | null;
  targetId?: string | null;
  targetType?: EntityType | null;
  editingRelation?: Relation | null;
}

const relationTypes = [
  { value: 'family', label: '亲属关系' },
  { value: 'professional', label: '职业关系' },
  { value: 'friend', label: '朋友关系' },
  { value: 'enemy', label: '敌对关系' },
  { value: 'romantic', label: '情感关系' },
  { value: 'evidence', label: '证据关联' },
  { value: 'causal', label: '因果关系' },
  { value: 'location', label: '地点关联' },
  { value: 'other', label: '其他' },
];

export const RelationEditorModal = ({
  isOpen,
  onClose,
  sourceId,
  sourceType,
  targetId,
  targetType,
  editingRelation,
}: RelationEditorModalProps) => {
  const {
    characters,
    events,
    locations,
    clues,
    addRelation,
    updateRelation,
    deleteRelation,
  } = useBoardStore();

  const [formData, setFormData] = useState({
    sourceId: '',
    sourceType: 'character' as EntityType,
    targetId: '',
    targetType: 'character' as EntityType,
    relationType: 'other',
    label: '',
    description: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingRelation) {
      setFormData({
        sourceId: editingRelation.sourceId,
        sourceType: editingRelation.sourceType,
        targetId: editingRelation.targetId,
        targetType: editingRelation.targetType,
        relationType: editingRelation.relationType,
        label: editingRelation.label,
        description: editingRelation.description || '',
      });
    } else {
      setFormData({
        sourceId: sourceId || '',
        sourceType: sourceType || 'character',
        targetId: targetId || '',
        targetType: targetType || 'character',
        relationType: 'other',
        label: '',
        description: '',
      });
    }
  }, [isOpen, sourceId, sourceType, targetId, targetType, editingRelation]);

  if (!isOpen) return null;

  const getAllEntities = (type: EntityType) => {
    switch (type) {
      case 'character':
        return characters;
      case 'event':
        return events;
      case 'location':
        return locations;
      case 'clue':
        return clues;
    }
  };

  const getEntityName = (type: EntityType, id: string) => {
    const entities = getAllEntities(type);
    const entity = entities.find((e: { id: string }) => e.id === id);
    if (!entity) return '未知';
    if (type === 'character') return (entity as { name: string }).name;
    if (type === 'event') return (entity as { title: string }).title;
    return (entity as { name?: string; title?: string }).name || (entity as { title?: string }).title || '未知';
  };

  const handleSubmit = () => {
    if (!formData.sourceId || !formData.targetId || !formData.label) {
      alert('请填写完整信息');
      return;
    }
    if (formData.sourceId === formData.targetId && formData.sourceType === formData.targetType) {
      alert('不能关联到自己');
      return;
    }
    if (editingRelation) {
      updateRelation(editingRelation.id, formData as Partial<Relation>);
    } else {
      addRelation(formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingRelation) return;
    if (confirm('确定要删除这条关系吗？')) {
      deleteRelation(editingRelation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-paper-texture bg-parchment-50 w-[480px] rounded-lg shadow-paper-hover border border-cork-300 flex flex-col overflow-hidden animate-drop">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cork-300 bg-parchment-100/80">
          <div className="flex items-center gap-2">
            <LinkIcon className="text-accent-red" size={20} />
            <h2 className="font-display text-lg text-ink-800">
              {editingRelation ? '编辑关系' : '新建关系'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-ink-200/50 text-ink-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-display text-sm text-ink-700">源实体类型</label>
              <select
                value={formData.sourceType}
                onChange={(e) =>
                  setFormData({ ...formData, sourceType: e.target.value as EntityType, sourceId: '' })
                }
                className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
              >
                {(['character', 'event', 'location', 'clue'] as EntityType[]).map((t) => (
                  <option key={t} value={t}>
                    {entityTypeLabels[t]}
                  </option>
                ))}
              </select>
              <select
                value={formData.sourceId}
                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
              >
                <option value="">-- 选择 --</option>
                {getAllEntities(formData.sourceType).map((e: { id: string; name?: string; title?: string }) => (
                  <option key={e.id} value={e.id}>
                    {e.name || e.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-display text-sm text-ink-700">目标实体类型</label>
              <select
                value={formData.targetType}
                onChange={(e) =>
                  setFormData({ ...formData, targetType: e.target.value as EntityType, targetId: '' })
                }
                className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
              >
                {(['character', 'event', 'location', 'clue'] as EntityType[]).map((t) => (
                  <option key={t} value={t}>
                    {entityTypeLabels[t]}
                  </option>
                ))}
              </select>
              <select
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
              >
                <option value="">-- 选择 --</option>
                {getAllEntities(formData.targetType).map((e: { id: string; name?: string; title?: string }) => (
                  <option key={e.id} value={e.id}>
                    {e.name || e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center py-1">
            <div className="text-xs font-display text-ink-500">
              {formData.sourceId && formData.sourceId
                ? `${getEntityName(formData.sourceType, formData.sourceId)} → ${getEntityName(formData.targetType, formData.targetId)}`
                : '请选择关联实体'}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-display text-sm text-ink-700">关系类型</label>
            <select
              value={formData.relationType}
              onChange={(e) => setFormData({ ...formData, relationType: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
            >
              {relationTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-display text-sm text-ink-700">
              关系标签 <span className="text-accent-red">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="如：父子、同事、证据..."
              className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-display text-sm text-ink-700">关系描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-cork-300 bg-white/80 font-body text-ink-800 min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
              placeholder="补充说明关系的细节..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-cork-300 bg-parchment-100/80">
          <div>
            {editingRelation && (
              <IconButton variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 size={16} />}>
                删除
              </IconButton>
            )}
          </div>
          <div className="flex gap-2">
            <IconButton variant="secondary" size="sm" onClick={onClose}>
              取消
            </IconButton>
            <IconButton icon={<Save size={16} />} variant="primary" size="sm" onClick={handleSubmit}>
              {editingRelation ? '保存修改' : '创建关系'}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};
