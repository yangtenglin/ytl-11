import { Toolbar } from '@/components/common/Toolbar';
import { EntityListPanel } from '@/components/sidebar/EntityListPanel';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { RulesPanel } from '@/components/rules/RulesPanel';
import { TimelineBar } from '@/components/timeline/TimelineBar';

const DetectiveBoard = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-cork-950 overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex relative overflow-hidden">
        <EntityListPanel />
        <div className="flex-1 flex flex-col relative min-w-0">
          <BoardCanvas />
          <TimelineBar />
        </div>
        <RulesPanel />
      </div>
    </div>
  );
};

export default DetectiveBoard;
