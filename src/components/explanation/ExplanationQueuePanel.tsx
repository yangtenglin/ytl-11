import { useState } from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  Undo2,
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { cn } from '@/lib/utils';
import { clueTypeLabels } from '@/utils/idGenerator';

export const ExplanationQueuePanel = () => {
  const {
    explanationQueue,
    explanationQueueOpen,
    setExplanationQueueOpen,
    clues,
    toggleExplanationQueue,
    clearExplanationQueue,
    addAllUnexplainedToQueue,
    batchExplainClues,
    undoExplanation,
    explanationHistory,
    selectEntity,
  } = useBoardStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkExplanation, setBulkExplanation] = useState('');
  const [individualExplanations, setIndividualExplanations] = useState<Record<string, string>>({});
  const [showBulkMode, setShowBulkMode] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const queueClues = explanationQueue
    .map((id) => clues.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const allUnexplainedCount = clues.filter((c) => !c.isExplained).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === queueClues.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(queueClues.map((c) => c.id)));
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleExplainSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      showToast('请先选择要解释的线索', 'info');
      return;
    }

    if (showBulkMode) {
      if (!bulkExplanation.trim()) {
        showToast('请填写解释说明内容', 'info');
        return;
      }
      batchExplainClues(ids, bulkExplanation.trim());
      showToast(`已批量解释 ${ids.length} 条线索 ✓`);
      setBulkExplanation('');
    } else {
      const needExplanation = ids.filter((id) => !individualExplanations[id]?.trim());
      if (needExplanation.length > 0) {
        showToast(`${needExplanation.length} 条线索未填写解释说明`, 'info');
        return;
      }

      const groupTs = new Date().toISOString();
      ids.forEach((id) => {
        batchExplainClues([id], individualExplanations[id].trim());
      });
      showToast(`已逐项解释 ${ids.length} 条线索 ✓`);
      setIndividualExplanations({});
    }

    setSelectedIds(new Set());
  };

  const handleExplainAll = () => {
    if (queueClues.length === 0) {
      showToast('队列为空', 'info');
      return;
    }
    if (!bulkExplanation.trim()) {
      showToast('请填写解释说明内容', 'info');
      return;
    }
    const ids = queueClues.map((c) => c.id);
    batchExplainClues(ids, bulkExplanation.trim());
    showToast(`已解释全部 ${ids.length} 条线索 ✓`);
    setBulkExplanation('');
    setSelectedIds(new Set());
  };

  const handleUndo = () => {
    const item = undoExplanation();
    if (item) {
      showToast('已撤销上一次解释操作 ↺', 'info');
    } else {
      showToast('没有可撤销的操作', 'info');
    }
  };

  const handleAddAllUnexplained = () => {
    addAllUnexplainedToQueue();
    showToast(`已将所有待解释线索加入队列`, 'info');
  };

  if (!explanationQueueOpen) {
    return (
      <button
        onClick={() => setExplanationQueueOpen(true)}
        className="absolute left-0 bottom-20 z-20 bg-accent-gold text-ink-900 px-2 py-4 rounded-r-md shadow-lg hover:bg-accent-gold/90 transition-colors flex flex-col items-center gap-1 group"
        title="打开解释队列"
      >
        <HelpCircle size={18} />
        <span className="text-[10px] font-display writing-vertical">解释队列</span>
        {allUnexplainedCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center shadow">
            {allUnexplainedCount}
          </span>
        )}
      </button>
    );
  }

  const isAllSelected = selectedIds.size === queueClues.length && queueClues.length > 0;
  const historyCount = explanationHistory.length;

  return (
    <>
      <div className="w-80 h-full flex flex-col bg-paper-texture bg-parchment-50 border-r-2 border-cork-400 shadow-xl animate-in slide-in-from-left">
        <div className="flex items-center justify-between px-3 py-2 border-b border-cork-300 bg-parchment-100/80">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="text-accent-gold" size={16} />
            <h2 className="font-display text-sm text-ink-800 tracking-wide">解释队列</h2>
            <span className="px-1.5 py-0.5 rounded bg-accent-gold/20 text-accent-gold text-[10px] font-bold">
              {queueClues.length}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleUndo}
              disabled={historyCount === 0}
              className={cn(
                'p-1 rounded transition-colors',
                historyCount > 0
                  ? 'hover:bg-cork-200 text-ink-500 hover:text-accent-purple'
                  : 'text-ink-300 cursor-not-allowed'
              )}
              title={`撤销上一次${historyCount > 0 ? '操作' : ''}`}
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={() => setExplanationQueueOpen(false)}
              className="p-1 rounded hover:bg-cork-200 text-ink-500 transition-colors"
              title="收起"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-cork-300 bg-parchment-50 px-2 py-1.5 gap-1">
          <button
            onClick={handleAddAllUnexplained}
            disabled={allUnexplainedCount === 0}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-body transition-colors',
              allUnexplainedCount > 0
                ? 'bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30'
                : 'bg-ink-200/50 text-ink-400 cursor-not-allowed'
            )}
          >
            <Plus size={11} />
            全部待解释({allUnexplainedCount})
          </button>
          <button
            onClick={clearExplanationQueue}
            disabled={queueClues.length === 0}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-body transition-colors',
              queueClues.length > 0
                ? 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'
                : 'bg-ink-200/50 text-ink-400 cursor-not-allowed'
            )}
          >
            <Trash2 size={11} />
            清空
          </button>
        </div>

        <div className="px-3 py-2 border-b border-cork-300 bg-parchment-100/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkMode(true)}
                className={cn(
                  'px-2 py-1 rounded text-[10px] font-body transition-colors',
                  showBulkMode
                    ? 'bg-accent-purple/20 text-accent-purple'
                    : 'text-ink-500 hover:bg-cork-200'
                )}
              >
                批量模式
              </button>
              <button
                onClick={() => setShowBulkMode(false)}
                className={cn(
                  'px-2 py-1 rounded text-[10px] font-body transition-colors',
                  !showBulkMode
                    ? 'bg-accent-purple/20 text-accent-purple'
                    : 'text-ink-500 hover:bg-cork-200'
                )}
              >
                逐项模式
              </button>
            </div>
            <button
              onClick={selectAll}
              className="px-2 py-1 rounded text-[10px] font-body text-ink-500 hover:bg-cork-200 transition-colors"
            >
              {isAllSelected ? '取消全选' : '全选'}
              {selectedIds.size > 0 && (
                <span className="ml-1 text-accent-purple font-bold">({selectedIds.size})</span>
              )}
            </button>
          </div>

          {showBulkMode && (
            <div>
              <label className="block text-[10px] font-display text-ink-600 mb-1">
                <Sparkles size={10} className="inline mr-0.5 text-accent-gold" />
                统一解释说明（应用到选中/全部）
              </label>
              <textarea
                value={bulkExplanation}
                onChange={(e) => setBulkExplanation(e.target.value)}
                className={cn(
                  'w-full px-2 py-1.5 rounded-md border border-cork-300 bg-white/80 font-body text-xs text-ink-800',
                  'placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all resize-y',
                  'min-h-[60px]'
                )}
                placeholder="例如：这是凶手故意留下的假线索，用于混淆调查方向..."
              />
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              onClick={handleExplainSelected}
              disabled={selectedIds.size === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-display transition-colors',
                selectedIds.size > 0
                  ? 'bg-accent-green text-white hover:bg-accent-green/90'
                  : 'bg-cork-300 text-ink-400 cursor-not-allowed'
              )}
            >
              <CheckCircle2 size={13} />
              解释选中 ({selectedIds.size})
            </button>
            <button
              onClick={handleExplainAll}
              disabled={queueClues.length === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-display transition-colors',
                queueClues.length > 0
                  ? 'bg-accent-gold text-ink-900 hover:bg-accent-gold/90'
                  : 'bg-cork-300 text-ink-400 cursor-not-allowed'
              )}
            >
              <Sparkles size={13} />
              一键解释全部
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {queueClues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-ink-400">
              <div className="w-14 h-14 rounded-full bg-cork-200/50 flex items-center justify-center mb-3">
                <Search className="text-ink-400" size={22} />
              </div>
              <div className="font-display text-sm mb-1 text-ink-500">解释队列为空</div>
              <div className="text-xs font-body text-center px-6 leading-relaxed">
                点击规则面板中的"未解释线索"或线索卡片上的
                <span className="text-accent-gold mx-0.5">加入队列</span>
                按钮，批量管理待解释线索
              </div>
              {allUnexplainedCount > 0 && (
                <button
                  onClick={handleAddAllUnexplained}
                  className="mt-4 flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-gold/20 text-accent-gold text-xs font-body hover:bg-accent-gold/30 transition-colors"
                >
                  <Plus size={12} />
                  将 {allUnexplainedCount} 条待解释线索加入队列
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-cork-200/70">
              {queueClues.map((clue) => {
                const isSelected = selectedIds.has(clue.id);
                return (
                  <div
                    key={clue.id}
                    className={cn(
                      'px-3 py-2.5 transition-colors group',
                      isSelected ? 'bg-accent-gold/10' : 'hover:bg-cork-100/50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(clue.id)}
                          className="w-3.5 h-3.5 accent-accent-purple cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={cn(
                              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-body',
                              'bg-ink-200/60 text-ink-600'
                            )}
                          >
                            {clueTypeLabels[clue.clueType]}
                          </span>
                          <span
                            className={cn(
                              'inline-flex px-1.5 py-0.5 rounded text-[9px] font-body',
                              clue.isExplained
                                ? 'bg-accent-green/20 text-accent-green'
                                : 'bg-accent-red/20 text-accent-red'
                            )}
                          >
                            {clue.isExplained ? '已解释' : '待解释'}
                          </span>
                        </div>
                        <div
                          className="font-display text-xs text-ink-800 truncate cursor-pointer hover:text-accent-purple transition-colors"
                          onClick={() => selectEntity(clue.id, 'clue')}
                        >
                          {clue.title}
                        </div>
                        {clue.description && (
                          <p className="text-[10px] text-ink-500 font-body mt-0.5 line-clamp-2 leading-snug">
                            {clue.description}
                          </p>
                        )}

                        {!showBulkMode && isSelected && (
                          <div className="mt-2">
                            <label className="block text-[9px] font-display text-ink-500 mb-0.5">
                              单独解释说明
                            </label>
                            <textarea
                              value={individualExplanations[clue.id] || ''}
                              onChange={(e) =>
                                setIndividualExplanations((prev) => ({
                                  ...prev,
                                  [clue.id]: e.target.value,
                                }))
                              }
                              className={cn(
                                'w-full px-2 py-1 rounded border border-cork-300 bg-white/80 font-body text-[10px]',
                                'placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-purple/40 focus:border-accent-purple transition-all resize-y',
                                'min-h-[42px]'
                              )}
                              placeholder="为这条线索单独填写解释..."
                            />
                          </div>
                        )}

                        {clue.isExplained && clue.explanation && (
                          <div className="mt-1.5 p-1.5 rounded bg-accent-green/10 border border-accent-green/20">
                            <div className="flex items-center gap-1 text-[9px] font-display text-accent-green mb-0.5">
                              <CheckCircle2 size={9} />
                              已有解释
                            </div>
                            <p className="text-[9px] text-ink-600 font-body line-clamp-2">
                              {clue.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleExplanationQueue(clue.id)}
                          className="p-1 rounded hover:bg-cork-200 text-ink-400 hover:text-accent-red transition-colors"
                          title="移出队列"
                        >
                          <X size={12} />
                        </button>
                        <button
                          onClick={() => selectEntity(clue.id, 'clue')}
                          className="p-1 rounded hover:bg-cork-200 text-ink-400 hover:text-accent-purple transition-colors"
                          title="查看详情"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {historyCount > 0 && (
          <div className="px-3 py-2 border-t border-cork-300 bg-parchment-100/50">
            <button
              onClick={handleUndo}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-accent-purple/10 text-accent-purple text-[11px] font-body hover:bg-accent-purple/20 transition-colors"
            >
              <Undo2 size={13} />
              撤销上一次解释操作（{historyCount > 0 ? `剩${historyCount}条记录` : ''}）
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={cn(
            'absolute top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300',
            toast.type === 'success'
              ? 'bg-accent-green text-white'
              : 'bg-ink-700 text-parchment-100'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span className="font-body text-xs">{toast.message}</span>
        </div>
      )}
    </>
  );
};
