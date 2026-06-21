import { useState, useMemo } from 'react';
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  FileQuestion,
  Users,
  Clock,
  Search,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { cn } from '@/lib/utils';
import type { ScoreBreakdownItem, SuspectScore } from '@/types';

type SortKey = 'total' | 'motive' | 'opportunity' | 'risk';

const sortOptions: { key: SortKey; label: string; icon: typeof Target }[] = [
  { key: 'total', label: '综合', icon: Trophy },
  { key: 'motive', label: '动机', icon: Target },
  { key: 'opportunity', label: '机会', icon: Zap },
  { key: 'risk', label: '风险', icon: AlertTriangle },
];

const sourceIconMap: Record<string, typeof Target> = {
  base: Target,
  clue: FileQuestion,
  relation: Users,
  event: Clock,
};

const sourceLabelMap: Record<string, string> = {
  base: '基础分',
  clue: '线索',
  relation: '关系',
  event: '事件',
};

export const ScoresPanel = () => {
  const {
    suspectScores,
    characters,
    rightPanelOpen,
    toggleRightPanel,
    calculateSuspectScores,
    selectEntity,
    setRightPanelTab,
  } = useBoardStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('total');
  const [threshold, setThreshold] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const getCharacterName = (id: string): string => {
    return characters.find((c) => c.id === id)?.name || id;
  };

  const getCharacterColor = (id: string): string => {
    return characters.find((c) => c.id === id)?.avatarColor || '#666';
  };

  const handleJump = (characterId: string) => {
    selectEntity(characterId, 'character');
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 70) return 'text-accent-red';
    if (score >= 40) return 'text-accent-gold';
    return 'text-accent-green';
  };

  const getScoreBgLevel = (score: number): string => {
    if (score >= 70) return 'bg-accent-red';
    if (score >= 40) return 'bg-accent-gold';
    return 'bg-accent-green';
  };

  const processedScores = useMemo(() => {
    const filtered = suspectScores.filter((s) => s[sortBy] >= threshold);
    return [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [suspectScores, sortBy, threshold]);

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

  return (
    <div className="w-72 h-full flex flex-col bg-cork-100 border-l-2 border-cork-400 shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cork-300 bg-parchment-100/80">
        <div className="flex items-center gap-1.5">
          <Trophy className="text-accent-gold" size={16} />
          <h2 className="font-display text-sm text-ink-800 tracking-wide">嫌疑度排行</h2>
          {processedScores.length > 0 && (
            <span className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center bg-accent-gold text-ink-900">
              {processedScores.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'p-1 rounded hover:bg-cork-200 transition-colors',
              filterOpen ? 'text-accent-gold bg-cork-200' : 'text-ink-500'
            )}
            title="筛选与排序"
          >
            <SlidersHorizontal size={14} />
          </button>
          <button
            onClick={() => setRightPanelTab('rules')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-red transition-colors"
            title="切换到规则检查"
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => setRightPanelTab('commute')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-green transition-colors"
            title="切换到通勤时间设置"
          >
            <MapPin size={14} />
          </button>
          <button
            onClick={calculateSuspectScores}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-gold transition-colors"
            title="重新计算"
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

      {filterOpen && (
        <div className="px-3 py-2.5 border-b border-cork-300 bg-parchment-50 space-y-2.5">
          <div>
            <div className="text-[10px] font-display text-ink-500 mb-1.5">排序方式</div>
            <div className="flex gap-1">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-display transition-colors',
                      sortBy === opt.key
                        ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                        : 'bg-cork-100 text-ink-500 border border-cork-300 hover:bg-cork-200'
                    )}
                  >
                    <Icon size={10} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-display text-ink-500">
                最低阈值（{sortOptions.find((o) => o.key === sortBy)?.label}）
              </span>
              <span className="text-[10px] font-display font-bold text-accent-gold">
                {threshold}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-cork-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {processedScores.length === 0 ? (
          <div className="text-center py-12 text-ink-400">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent-gold/10 flex items-center justify-center mb-2">
              <Trophy className="text-accent-gold" size={20} />
            </div>
            <div className="font-display text-sm mb-1">暂无数据</div>
            <div className="text-xs font-body">
              {suspectScores.length > 0
                ? '当前阈值下无符合条件的人物'
                : '请先创建人物角色'}
            </div>
          </div>
        ) : (
          processedScores.map((score, index) => (
            <ScoreItem
              key={score.characterId}
              score={score}
              rank={index + 1}
              isExpanded={expandedId === score.characterId}
              onToggle={() =>
                setExpandedId(expandedId === score.characterId ? null : score.characterId)
              }
              characterName={getCharacterName(score.characterId)}
              characterColor={getCharacterColor(score.characterId)}
              onJump={handleJump}
              getScoreLevel={getScoreLevel}
              getScoreBgLevel={getScoreBgLevel}
              sortBy={sortBy}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface ScoreItemProps {
  score: SuspectScore;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  characterName: string;
  characterColor: string;
  onJump: (id: string) => void;
  getScoreLevel: (score: number) => string;
  getScoreBgLevel: (score: number) => string;
  sortBy: SortKey;
}

function ScoreItem({
  score,
  rank,
  isExpanded,
  onToggle,
  characterName,
  characterColor,
  onJump,
  getScoreLevel,
  getScoreBgLevel,
  sortBy,
}: ScoreItemProps) {
  return (
    <div
      className={cn(
        'rounded-md border bg-paper-texture overflow-hidden transition-all',
        'bg-parchment-50 border-cork-300'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-2.5 flex items-start gap-2 text-left hover:bg-black/5 transition-colors"
      >
        <div className="flex-shrink-0 flex flex-col items-center">
          <span
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
              rank === 1
                ? 'bg-accent-gold'
                : rank === 2
                ? 'bg-ink-400'
                : rank === 3
                ? 'bg-amber-700'
                : 'bg-cork-400'
            )}
          >
            {rank}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-3 h-3 rounded-full shadow-inner flex-shrink-0"
              style={{ backgroundColor: characterColor }}
            />
            <span className="font-display text-sm text-ink-800 truncate">{characterName}</span>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-body text-ink-500">
              {sortBy === 'total' ? '综合嫌疑度' : sortOptions.find((o) => o.key === sortBy)?.label + '分'}
            </span>
            <span className={cn('text-lg font-display font-bold', getScoreLevel(score[sortBy]))}>
              {score[sortBy]}
            </span>
          </div>

          <div className="space-y-1">
            <ScoreBar
              label="动机"
              value={score.motive}
              color="bg-accent-gold"
              icon={<Target size={9} />}
              active={sortBy === 'motive'}
            />
            <ScoreBar
              label="机会"
              value={score.opportunity}
              color="bg-accent-green"
              icon={<Zap size={9} />}
              active={sortBy === 'opportunity'}
            />
            <ScoreBar
              label="风险"
              value={score.risk}
              color="bg-accent-red"
              icon={<AlertTriangle size={9} />}
              active={sortBy === 'risk'}
            />
          </div>
        </div>

        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp size={14} className="text-ink-400" />
          ) : (
            <ChevronDown size={14} className="text-ink-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-0 border-t border-black/5">
          <div className="mt-2 space-y-3">
            <BreakdownSection
              title="动机明细"
              items={score.motiveBreakdown}
              color="text-accent-gold"
              onJump={onJump}
            />
            <BreakdownSection
              title="机会明细"
              items={score.opportunityBreakdown}
              color="text-accent-green"
              onJump={onJump}
            />
            <BreakdownSection
              title="风险明细"
              items={score.riskBreakdown}
              color="text-accent-red"
              onJump={onJump}
            />
          </div>

          <button
            onClick={() => onJump(score.characterId)}
            className="mt-3 w-full py-1.5 rounded-md bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold text-xs font-display transition-colors"
          >
            查看人物详情
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
  icon,
  active,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', active && 'bg-accent-gold/5 -mx-1 px-1 rounded')}>
      <span className="text-ink-500 flex-shrink-0">{icon}</span>
      <span className={cn('text-[9px] font-body w-6 flex-shrink-0', active ? 'text-ink-800 font-bold' : 'text-ink-500')}>{label}</span>
      <div className="flex-1 h-1.5 bg-cork-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', color, active && 'h-2')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('text-[9px] font-display font-bold w-6 text-right flex-shrink-0', active ? 'text-ink-800' : 'text-ink-600')}>
        {value}
      </span>
    </div>
  );
}

function BreakdownSection({
  title,
  items,
  color,
  onJump,
}: {
  title: string;
  items: ScoreBreakdownItem[];
  color: string;
  onJump: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className={cn('text-[10px] font-display font-bold', color)}>{title}</span>
        <div className="flex-1 h-px bg-cork-200" />
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => {
          const Icon = sourceIconMap[item.sourceType] || Target;
          return (
            <div
              key={idx}
              className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-cork-100/50"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Icon size={10} className="text-ink-400 flex-shrink-0" />
                <span className="text-[10px] font-body text-ink-600 truncate">{item.label}</span>
              </div>
              <span className={cn('text-[10px] font-display font-bold flex-shrink-0 ml-2', color)}>
                +{item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
