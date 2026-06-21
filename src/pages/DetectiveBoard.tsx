import { Toolbar } from '@/components/common/Toolbar';
import { EntityListPanel } from '@/components/sidebar/EntityListPanel';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { RulesPanel } from '@/components/rules/RulesPanel';
import { ScoresPanel } from '@/components/scores/ScoresPanel';
import { TimelineBar } from '@/components/timeline/TimelineBar';
import { useBoardStore } from '@/store/useBoardStore';

const DetectiveBoard = () => {
  const { rightPanelTab } = useBoardStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-cork-950 overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex relative overflow-hidden">
        <EntityListPanel />
        <div className="flex-1 flex flex-col relative min-w-0">
          <BoardCanvas />
          <TimelineBar />
        </div>
        {rightPanelTab === 'rules' ? <RulesPanel /> : <ScoresPanel />}
      </div>
    </div>
  );
};

export default DetectiveBoard;
