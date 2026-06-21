import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { importanceColors, formatShortDate } from '@/utils/idGenerator';
import { cn } from '@/lib/utils';

export const TimelineBar = () => {
  const { events, timeRangeFilter, setTimeRangeFilter, selectEntity, violations } = useBoardStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const conflictEventIds = useMemo(() => {
    const ids = new Set<string>();
    violations
      .filter((v) => v.type === 'time_conflict')
      .forEach((v) => {
        v.relatedEntityIds.forEach((id) => {
          if (events.some((e) => e.id === id)) {
            ids.add(id);
          }
        });
      });
    return ids;
  }, [violations, events]);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [events]
  );

  const timeBounds = useMemo(() => {
    if (sortedEvents.length === 0) {
      const now = new Date();
      return {
        min: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        max: new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime(),
      };
    }
    const startTimes = sortedEvents.map((e) => new Date(e.timestamp).getTime());
    const endTimes = sortedEvents.map((e) =>
      new Date(e.endTimestamp || e.timestamp).getTime()
    );
    const allTimes = [...startTimes, ...endTimes];
    const padding = (Math.max(...allTimes) - Math.min(...allTimes)) * 0.1 || 86400000;
    return { min: Math.min(...allTimes) - padding, max: Math.max(...allTimes) + padding };
  }, [sortedEvents]);

  const totalDuration = timeBounds.max - timeBounds.min;

  const handleEventClick = (eventId: string) => {
    selectEntity(eventId, 'event');
  };

  const handleSliderChange = (type: 'start' | 'end', value: string) => {
    const newFilter = { ...timeRangeFilter };
    if (value) {
      newFilter[type] = new Date(value).toISOString();
    } else {
      newFilter[type] = null;
    }
    setTimeRangeFilter(newFilter.start, newFilter.end);
  };

  const clearFilter = () => {
    setTimeRangeFilter(null, null);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="h-8 w-full bg-wood-texture bg-cork-800 border-t-2 border-cork-600 text-parchment-200 flex items-center justify-center gap-2 hover:bg-cork-700 transition-colors font-display text-xs"
      >
        <ChevronUp size={14} />
        <Calendar size={14} />
        时间轴 · {events.length} 个事件
        {conflictEventIds.size > 0 && (
          <span className="flex items-center gap-0.5 text-accent-red">
            <AlertTriangle size={12} />
            {conflictEventIds.size} 个冲突
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-wood-texture bg-cork-800 border-t-2 border-cork-600 shadow-inner-wood">
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Calendar className="text-accent-gold" size={14} />
          <span className="font-display text-xs text-parchment-200 tracking-wide">时间轴</span>
          <span className="text-[10px] text-parchment-400 font-body">
            共 {events.length} 个事件
          </span>
          {conflictEventIds.size > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-accent-red font-body">
              <AlertTriangle size={10} />
              {conflictEventIds.size} 个时间冲突
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-parchment-300">
            <span>筛选:</span>
            <input
              type="date"
              value={timeRangeFilter.start ? timeRangeFilter.start.slice(0, 10) : ''}
              onChange={(e) => handleSliderChange('start', e.target.value)}
              className="px-1.5 py-0.5 text-xs rounded bg-cork-900/60 border border-cork-600 text-parchment-200"
            />
            <span>—</span>
            <input
              type="date"
              value={timeRangeFilter.end ? timeRangeFilter.end.slice(0, 10) : ''}
              onChange={(e) => handleSliderChange('end', e.target.value)}
              className="px-1.5 py-0.5 text-xs rounded bg-cork-900/60 border border-cork-600 text-parchment-200"
            />
            {(timeRangeFilter.start || timeRangeFilter.end) && (
              <button
                onClick={clearFilter}
                className="px-1.5 py-0.5 text-[10px] rounded bg-accent-red/80 text-parchment-50 hover:bg-accent-red transition-colors"
              >
                清除
              </button>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-0.5 rounded hover:bg-cork-700 text-parchment-400 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-3 pt-1">
        <div className="relative h-28 bg-cork-900/40 rounded-md border border-cork-700">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cork-500 to-transparent" />

          <div className="absolute left-0 right-0 top-2 bottom-6">
            {sortedEvents.map((event, idx) => {
              const startTime = new Date(event.timestamp).getTime();
              const endTime = new Date(
                event.endTimestamp || event.timestamp
              ).getTime();
              const startPosition =
                totalDuration > 0
                  ? ((startTime - timeBounds.min) / totalDuration) * 100
                  : 50;
              const endPosition =
                totalDuration > 0
                  ? ((endTime - timeBounds.min) / totalDuration) * 100
                  : 52;
              const width = Math.max(endPosition - startPosition, 2);

              const isFiltered =
                (timeRangeFilter.start &&
                  startTime < new Date(timeRangeFilter.start).getTime()) ||
                (timeRangeFilter.end &&
                  startTime > new Date(timeRangeFilter.end).getTime());

              const hasConflict = conflictEventIds.has(event.id);
              const isEven = idx % 2 === 0;

              return (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  style={{
                    left: `${startPosition}%`,
                    width: `${width}%`,
                    top: isEven ? '0%' : '50%',
                  }}
                  className={cn(
                    'absolute group transition-all duration-200',
                    isFiltered && 'opacity-30'
                  )}
                >
                  <div
                    className={cn(
                      'h-6 rounded-md border-2 shadow-pin flex items-center justify-center transition-all group-hover:scale-y-110 relative overflow-hidden',
                      hasConflict
                        ? 'border-accent-red animate-pulse'
                        : 'border-cork-100'
                    )}
                    style={{
                      backgroundColor: isFiltered
                        ? '#7c6850'
                        : importanceColors[event.importance],
                      boxShadow: hasConflict
                        ? '0 0 12px 2px rgba(220, 38, 38, 0.6)'
                        : undefined,
                    }}
                  >
                    {hasConflict && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-red/40 to-transparent animate-pulse" />
                    )}
                    <div className="relative w-full px-1 truncate text-[9px] font-display text-white/90">
                      {event.title}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'bg-paper-texture bg-parchment-100 rounded shadow-paper border border-cork-300 px-2 py-1 text-left w-28 transform -translate-x-1/2 transition-all absolute left-1/2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none',
                      isEven ? 'top-full mt-1' : 'bottom-full mb-1'
                    )}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {hasConflict && (
                        <AlertTriangle size={10} className="text-accent-red" />
                      )}
                      <div className="text-[10px] text-accent-gold font-body">
                        {formatShortDate(event.timestamp)}
                      </div>
                    </div>
                    <div className="text-[11px] font-display text-ink-800 truncate leading-tight">
                      {event.title}
                    </div>
                    <div className="text-[9px] text-ink-500 font-body mt-0.5">
                      {formatTime(event.timestamp)} — {formatTime(event.endTimestamp || event.timestamp)}
                    </div>
                    {hasConflict && (
                      <div className="text-[9px] text-accent-red font-body mt-0.5 font-bold">
                        ⚠ 存在时间冲突
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {sortedEvents.length > 0 && (
            <div className="absolute left-0 right-0 bottom-1 flex justify-between px-2 text-[9px] text-parchment-500 font-body">
              <span>{new Date(timeBounds.min).toLocaleDateString('zh-CN')}</span>
              <span>{new Date(timeBounds.max).toLocaleDateString('zh-CN')}</span>
            </div>
          )}

          {sortedEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-parchment-500 text-xs font-body">
              暂无事件，从左侧面板添加开始
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}
