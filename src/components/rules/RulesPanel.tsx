import { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  UserX,
  RefreshCw,
  X,
  Trophy,
  MapPin,
} from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { cn } from '@/lib/utils';
import { entityTypeLabels } from '@/utils/idGenerator';
import type { ViolationType, ViolationSeverity, RuleViolation } from '@/types';

const typeConfig: Record<ViolationType, { icon: typeof Clock; label: string; color: string }> = {
  time_conflict: { icon: Clock, label: '时间冲突', color: 'text-accent-red' },
  unexplained_clue: { icon: HelpCircle, label: '未解释线索', color: 'text-accent-gold' },
  isolated_character: { icon: UserX, label: '孤立角色', color: 'text-ink-500' },
};

const severityConfig: Record<ViolationSeverity, { icon: typeof AlertTriangle; label: string; bg: string; border: string }> = {
  error: {
    icon: AlertCircle,
    label: '错误',
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/40',
  },
  warning: {
    icon: AlertTriangle,
    label: '警告',
    bg: 'bg-accent-gold/10',
    border: 'border-accent-gold/40',
  },
  info: {
    icon: Info,
    label: '提示',
    bg: 'bg-ink-500/10',
    border: 'border-ink-500/40',
  },
};

export const RulesPanel = () => {
  const { violations, rightPanelOpen, toggleRightPanel, runRulesCheck, selectEntity, characters, events, clues, setRightPanelTab } = useBoardStore();
  const [activeFilter, setActiveFilter] = useState<ViolationType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    runRulesCheck();
  }, [runRulesCheck]);

  if (!rightPanelOpen) {
    return (
      <button
        onClick={toggleRightPanel}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-cork-800 text-parchment-200 px-1.5 py-6 rounded-l-md shadow-lg hover:bg-cork-700 transition-colors flex items-center"
      >
        <ChevronLeft size={18} />
      </button>
    );
  }

  const filtered = activeFilter === 'all' ? violations : violations.filter((v) => v.type === activeFilter);

  const countByType = {
    time_conflict: violations.filter((v) => v.type === 'time_conflict').length,
    unexplained_clue: violations.filter((v) => v.type === 'unexplained_clue').length,
    isolated_character: violations.filter((v) => v.type === 'isolated_character').length,
  };

  const getEntityName = (id: string, type?: string): string => {
    if (type === 'character') return characters.find((c) => c.id === id)?.name || id;
    if (type === 'event') return events.find((e) => e.id === id)?.title || id;
    if (type === 'clue') return clues.find((c) => c.id === id)?.title || id;
    const char = characters.find((c) => c.id === id);
    if (char) return char.name;
    const ev = events.find((e) => e.id === id);
    if (ev) return ev.title;
    const cl = clues.find((c) => c.id === id);
    if (cl) return cl.title;
    return id;
  };

  const handleJump = (entityId: string) => {
    let type: 'character' | 'event' | 'location' | 'clue' = 'character';
    if (characters.find((c) => c.id === entityId)) type = 'character';
    else if (events.find((e) => e.id === entityId)) type = 'event';
    else if (clues.find((c) => c.id === entityId)) type = 'clue';
    selectEntity(entityId, type);
  };

  return (
    <div className="w-72 h-full flex flex-col bg-cork-100 border-l-2 border-cork-400 shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cork-300 bg-parchment-100/80">
        <div className="flex items-center gap-1.5">
          <Search className="text-accent-red" size={16} />
          <h2 className="font-display text-sm text-ink-800 tracking-wide">规则检查</h2>
          {violations.length > 0 && (
            <span
              className={cn(
                'min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center',
                violations.some((v) => v.severity === 'error')
                  ? 'bg-accent-red text-white'
                  : violations.some((v) => v.severity === 'warning')
                  ? 'bg-accent-gold text-ink-900'
                  : 'bg-ink-500 text-white'
              )}
            >
              {violations.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setRightPanelTab('scores')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-gold transition-colors"
            title="切换到嫌疑排行"
          >
            <Trophy size={14} />
          </button>
          <button
            onClick={() => setRightPanelTab('commute')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-green transition-colors"
            title="切换到通勤时间设置"
          >
            <MapPin size={14} />
          </button>
          <button
            onClick={runRulesCheck}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-green transition-colors"
            title="重新检查"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={toggleRightPanel}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-cork-300 bg-parchment-50">
        {([
          { key: 'all', label: '全部', count: violations.length },
          { key: 'time_conflict', ...typeConfig.time_conflict, count: countByType.time_conflict },
          { key: 'unexplained_clue', ...typeConfig.unexplained_clue, count: countByType.unexplained_clue },
          { key: 'isolated_character', ...typeConfig.isolated_character, count: countByType.isolated_character },
        ] as const).map((tab) => {
          const Icon = (tab as { icon?: typeof Clock }).icon || Info;
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as ViolationType | 'all')}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-1.5 px-0.5 transition-all relative',
                isActive
                  ? 'text-ink-800 bg-parchment-100'
                  : 'text-ink-500 hover:text-ink-700 hover:bg-cork-100'
              )}
            >
              {tab.key !== 'all' && <Icon size={13} className={(tab as { color?: string }).color} />}
              <span className="text-[9px] font-display leading-tight">{tab.label}</span>
              <span className="text-[9px] font-body">{tab.count}</span>
              {isActive && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-accent-gold rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ink-400">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent-green/10 flex items-center justify-center mb-2">
              <Search className="text-accent-green" size={20} />
            </div>
            <div className="font-display text-sm mb-1 text-accent-green">一切正常</div>
            <div className="text-xs font-body">未发现规则问题</div>
          </div>
        ) : (
          filtered.map((v) => <ViolationItem key={v.id} violation={v} expandedId={expandedId} setExpandedId={setExpandedId} getEntityName={getEntityName} onJump={handleJump} />)
        )}
      </div>
    </div>
  );
};

function ViolationItem({
  violation,
  expandedId,
  setExpandedId,
  getEntityName,
  onJump,
}: {
  violation: RuleViolation;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  getEntityName: (id: string, type?: string) => string;
  onJump: (id: string) => void;
}) {
  const isExpanded = expandedId === violation.id;
  const sev = severityConfig[violation.severity];
  const tc = typeConfig[violation.type];
  const TypeIcon = tc.icon;
  const SevIcon = sev.icon;

  return (
    <div
      className={cn(
        'rounded-md border bg-paper-texture overflow-hidden transition-all',
        sev.bg,
        sev.border
      )}
    >
      <button
        onClick={() => setExpandedId(isExpanded ? null : violation.id)}
        className="w-full p-2.5 flex items-start gap-2 text-left hover:bg-black/5 transition-colors"
      >
        <div className={cn('flex-shrink-0 mt-0.5', tc.color)}>
          <TypeIcon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <SevIcon size={11} className={tc.color} />
            <span className="text-[10px] font-display text-ink-600 uppercase tracking-wide">{sev.label}</span>
          </div>
          <div className="text-xs font-body text-ink-800 leading-snug">{violation.message}</div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? <ChevronLeft size={12} className="text-ink-400 rotate-[-90deg]" /> : <ChevronLeft size={12} className="text-ink-400 rotate-90" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-0 border-t border-black/5">
          <pre className="text-[11px] font-body text-ink-600 whitespace-pre-wrap leading-relaxed mt-2 mb-2">
            {violation.details}
          </pre>
          {violation.relatedEntityIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {violation.relatedEntityIds.map((id) => (
                <button
                  key={id}
                  onClick={() => onJump(id)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-body bg-white/60 border border-cork-300 text-ink-700 hover:bg-accent-gold/20 hover:border-accent-gold transition-colors"
                >
                  → {getEntityName(id)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
