import { useState } from 'react';
import { MapPin, Plus, Trash2, ChevronRight, Clock, Search } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { cn } from '@/lib/utils';

export const CommutePanel = () => {
  const {
    locations,
    commuteTimes,
    defaultCommuteMinutes,
    rightPanelOpen,
    toggleRightPanel,
    addCommuteTime,
    updateCommuteTime,
    deleteCommuteTime,
    setDefaultCommuteMinutes,
    setRightPanelTab,
  } = useBoardStore();

  const [newLocationA, setNewLocationA] = useState('');
  const [newLocationB, setNewLocationB] = useState('');
  const [newMinutes, setNewMinutes] = useState(30);

  const handleAdd = () => {
    if (!newLocationA || !newLocationB || newLocationA === newLocationB) return;
    addCommuteTime({
      locationAId: newLocationA,
      locationBId: newLocationB,
      minutes: newMinutes,
    });
    setNewLocationA('');
    setNewLocationB('');
    setNewMinutes(30);
  };

  const getLocationName = (id: string) => {
    return locations.find((l) => l.id === id)?.name || '未知地点';
  };

  const availableLocationsForB = locations.filter((l) => l.id !== newLocationA);
  const existingPairs = new Set(
    commuteTimes.map(
      (ct) => `${ct.locationAId}-${ct.locationBId}`
    )
  );

  if (!rightPanelOpen) {
    return (
      <button
        onClick={toggleRightPanel}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-cork-800 text-parchment-200 px-1.5 py-6 rounded-l-md shadow-lg hover:bg-cork-700 transition-colors flex items-center"
      >
        <ChevronRight size={18} className="rotate-180" />
      </button>
    );
  }

  return (
    <div className="w-72 h-full flex flex-col bg-cork-100 border-l-2 border-cork-400 shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cork-300 bg-parchment-100/80">
        <div className="flex items-center gap-1.5">
          <Clock className="text-accent-gold" size={16} />
          <h2 className="font-display text-sm text-ink-800 tracking-wide">通勤时间</h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setRightPanelTab('rules')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-red transition-colors"
            title="切换到规则检查"
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => setRightPanelTab('scores')}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 hover:text-accent-gold transition-colors"
            title="切换到嫌疑排行"
          >
            <MapPin size={14} />
          </button>
          <button
            onClick={toggleRightPanel}
            className="p-1 rounded hover:bg-cork-200 text-ink-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="bg-paper-texture bg-parchment-50 rounded-md border border-cork-300 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-accent-gold" />
            <span className="font-display text-xs text-ink-700">默认通勤时间</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="120"
              value={defaultCommuteMinutes}
              onChange={(e) => setDefaultCommuteMinutes(Number(e.target.value))}
              className="flex-1 h-2 bg-cork-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
            />
            <span className="text-xs font-display text-accent-gold font-bold w-12 text-right">
              {defaultCommuteMinutes} 分钟
            </span>
          </div>
          <p className="text-[10px] text-ink-500 font-body mt-1.5">
            未设置通勤时间的地点之间使用此默认值
          </p>
        </div>

        <div className="bg-paper-texture bg-parchment-50 rounded-md border border-cork-300 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Plus size={12} className="text-accent-green" />
            <span className="font-display text-xs text-ink-700">添加通勤时间</span>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newLocationA}
                onChange={(e) => setNewLocationA(e.target.value)}
                className="px-2 py-1.5 text-xs rounded border border-cork-300 bg-white/80 text-ink-800"
              >
                <option value="">起点</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <select
                value={newLocationB}
                onChange={(e) => setNewLocationB(e.target.value)}
                className="px-2 py-1.5 text-xs rounded border border-cork-300 bg-white/80 text-ink-800"
              >
                <option value="">终点</option>
                {availableLocationsForB.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="600"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="flex-1 px-2 py-1.5 text-xs rounded border border-cork-300 bg-white/80 text-ink-800"
                placeholder="分钟数"
              />
              <button
                onClick={handleAdd}
                disabled={
                  !newLocationA ||
                  !newLocationB ||
                  newLocationA === newLocationB ||
                  existingPairs.has(`${newLocationA}-${newLocationB}`) ||
                  existingPairs.has(`${newLocationB}-${newLocationA}`)
                }
                className={cn(
                  'px-3 py-1.5 text-xs font-body rounded transition-colors',
                  newLocationA &&
                  newLocationB &&
                  newLocationA !== newLocationB &&
                  !existingPairs.has(`${newLocationA}-${newLocationB}`) &&
                  !existingPairs.has(`${newLocationB}-${newLocationA}`)
                    ? 'bg-accent-green/80 text-white hover:bg-accent-green'
                    : 'bg-cork-300 text-cork-500 cursor-not-allowed'
                )}
              >
                添加
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs text-ink-600">已设置通勤时间</span>
            <span className="text-[10px] text-ink-500 font-body">
              共 {commuteTimes.length} 条
            </span>
          </div>
          {commuteTimes.length === 0 ? (
            <div className="text-center py-6 text-ink-400 bg-cork-100/50 rounded-md border border-dashed border-cork-300">
              <MapPin className="mx-auto mb-1.5 text-ink-400" size={20} />
              <div className="text-xs font-body">暂无通勤时间设置</div>
              <div className="text-[10px] font-body text-ink-500 mt-0.5">
                添加地点间的通勤时间以启用不在场核验
              </div>
            </div>
          ) : (
            commuteTimes.map((ct) => (
              <div
                key={ct.id}
                className="bg-paper-texture bg-parchment-50 rounded-md border border-cork-300 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs font-body text-ink-700">
                      <span className="truncate">{getLocationName(ct.locationAId)}</span>
                      <MapPin size={10} className="text-accent-gold flex-shrink-0" />
                      <span className="truncate">{getLocationName(ct.locationBId)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} className="text-ink-500" />
                      <span className="text-[11px] font-display text-accent-gold font-bold">
                        {ct.minutes} 分钟
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="600"
                      value={ct.minutes}
                      onChange={(e) =>
                        updateCommuteTime(ct.id, { minutes: Number(e.target.value) })
                      }
                      className="w-14 px-1.5 py-0.5 text-[10px] rounded border border-cork-300 bg-white/80 text-ink-800"
                    />
                    <button
                      onClick={() => deleteCommuteTime(ct.id)}
                      className="p-1 rounded hover:bg-accent-red/10 text-ink-400 hover:text-accent-red transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
