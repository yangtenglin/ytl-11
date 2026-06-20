import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { importanceColors, formatShortDate } from '@/utils/idGenerator';
import { cn } from '@/lib/utils';

export const TimelineBar = () => {
  const { events, timeRangeFilter, setTimeRangeFilter, selectEntity } = useBoardStore();
  const [isExpanded, setIsExpanded] = useState(true);

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
    const times = sortedEvents.map((e) => new Date(e.timestamp).getTime());
    const padding = (Math.max(...times) - Math.min(...times)) * 0.1 || 86400000;
    return { min: Math.min(...times) - padding, max: Math.max(...times) + padding };
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
        <div className="relative h-24 bg-cork-900/40 rounded-md border border-cork-700">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cork-500 to-transparent" />

          <div className="absolute left-0 right-0 top-1 bottom-3">
            {sortedEvents.map((event, idx) => {
              const t = new Date(event.timestamp).getTime();
              const position = totalDuration > 0 ? ((t - timeBounds.min) / totalDuration) * 100 : 50;
              const isFiltered =
                (timeRangeFilter.start && t < new Date(timeRangeFilter.start).getTime()) ||
                (timeRangeFilter.end && t > new Date(timeRangeFilter.end).getTime());

              return (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  style={{ left: `${position}%` }}
                  className={cn(
                    'absolute -translate-x-1/2 top-0 group transition-all duration-200',
                    isFiltered && 'opacity-30'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 border-cork-100 shadow-pin flex items-center justify-center transition-transform group-hover:scale-125',
                      isFiltered ? 'bg-cork-600' : ''
                    )}
                    style={{
                      backgroundColor: isFiltered ? undefined : importanceColors[event.importance],
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  </div>
                  <div className="w-px h-4 bg-cork-500 mx-auto" />
                  <div
                    className={cn(
                      'bg-paper-texture bg-parchment-100 rounded shadow-paper border border-cork-300 px-2 py-1 text-left w-28 transform -translate-x-1/2 mt-0.5 transition-all',
                      idx % 2 === 0 ? '' : 'order-first mb-0.5',
                      'group-hover:shadow-paper-hover group-hover:-translate-y-0.5'
                    )}
                  >
                    <div className="text-[10px] text-accent-gold font-body">
                      {formatShortDate(event.timestamp)}
                    </div>
                    <div className="text-[11px] font-display text-ink-800 truncate leading-tight">
                      {event.title}
                    </div>
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
