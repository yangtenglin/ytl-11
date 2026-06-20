import { Save, Download, Upload, Trash2, ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';
import { IconButton } from './IconButton';
import { useBoardStore } from '@/store/useBoardStore';
import { downloadJSON, readFileAsText } from '@/utils/exportImport';
import { useRef } from 'react';

export const Toolbar = () => {
  const { exportData, importData, clearAll, setZoom, zoom, runRulesCheck } = useBoardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    downloadJSON(json, `detective-board-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await readFileAsText(file);
        importData(text);
      } catch (err) {
        console.error('导入失败:', err);
        alert('文件导入失败，请检查文件格式');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      clearAll();
    }
  };

  const handleResetView = () => {
    setZoom(1);
    useBoardStore.getState().setPan({ x: 0, y: 0 });
  };

  return (
    <div className="h-14 bg-wood-texture bg-cork-900 border-b-2 border-cork-700 shadow-inner-wood flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl text-parchment-100 tracking-wider">
          <span className="text-accent-gold">Case</span> Board
        </h1>
        <span className="font-hand text-parchment-200/70 text-lg ml-1">侦探板</span>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={<Search size={16} />}
          variant="ghost"
          size="sm"
          onClick={runRulesCheck}
          title="运行规则检查"
        >
          检查
        </IconButton>

        <div className="w-px h-6 bg-cork-700 mx-1" />

        <IconButton
          icon={<ZoomOut size={16} />}
          variant="ghost"
          size="sm"
          onClick={() => setZoom(zoom - 0.1)}
          title="缩小"
        />
        <span className="text-parchment-200 text-xs font-display w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton
          icon={<ZoomIn size={16} />}
          variant="ghost"
          size="sm"
          onClick={() => setZoom(zoom + 0.1)}
          title="放大"
        />
        <IconButton
          icon={<Maximize2 size={16} />}
          variant="ghost"
          size="sm"
          onClick={handleResetView}
          title="重置视图"
        />

        <div className="w-px h-6 bg-cork-700 mx-1" />

        <IconButton
          icon={<Upload size={16} />}
          variant="secondary"
          size="sm"
          onClick={handleImportClick}
          title="导入项目"
        >
          导入
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
        <IconButton
          icon={<Download size={16} />}
          variant="primary"
          size="sm"
          onClick={handleExport}
          title="导出项目"
        >
          导出
        </IconButton>

        <div className="w-px h-6 bg-cork-700 mx-1" />

        <IconButton
          icon={<Trash2 size={16} />}
          variant="ghost"
          size="sm"
          onClick={handleClear}
          title="清空所有"
        >
          清空
        </IconButton>
      </div>
    </div>
  );
};
