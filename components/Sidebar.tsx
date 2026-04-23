import React, { useRef } from 'react';

interface SidebarProps {
  videoFile: File | null;
  onFileChange: (file: File) => void;
  comments: string;
  onCommentsChange: (value: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  analysisComplete: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  videoFile,
  onFileChange,
  comments,
  onCommentsChange,
  isAnalyzing,
  onAnalyze,
  analysisComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <section className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-r border-slate-800 bg-slate-900 shrink-0 overflow-y-auto custom-scrollbar h-full z-20">
      <div className="p-6 flex flex-col gap-6 h-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1 text-slate-100">원본 소스</h2>
          <p className="text-sm text-slate-400">Gemini가 분석할 영상을 업로드하세요.</p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-300">비디오 입력</label>
          <div 
            className={`group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
              videoFile ? 'border-primary/40 bg-primary/5' : 'border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 cursor-pointer'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !videoFile && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleChange}
            />
            
            {videoFile ? (
              <>
                <div className="p-3 rounded-full bg-slate-800 shadow-sm ring-1 ring-slate-700">
                  <span className="material-symbols-outlined text-[28px] text-green-500">check_circle</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm font-semibold text-slate-200 break-all">{videoFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium underline z-10"
                >
                  비디오 교체
                </button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-slate-800 shadow-sm ring-1 ring-slate-700 group-hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-slate-500 group-hover:text-primary">upload_file</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-sm font-semibold text-slate-400">클릭 또는 드래그하여 업로드</p>
                  <p className="text-xs text-slate-500">MP4, MOV (최대 50MB)</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-slate-300">분석 가이드라인</label>
          </div>
          <div className="relative flex-1">
            <textarea 
              className="form-textarea w-full h-full resize-none rounded-xl border-slate-700 bg-slate-800/50 focus:ring-2 focus:ring-primary/20 focus:border-primary p-4 text-sm leading-relaxed placeholder:text-slate-500 transition-all focus:bg-slate-800 text-slate-200"
              placeholder="예: 시네마틱 구도, 조명 연출, 그리고 등장인물의 감정선 변화를 중심으로 분석해줘..."
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              disabled={isAnalyzing}
            ></textarea>
          </div>
        </div>

        <div className="pt-4 mt-auto border-t border-slate-800">
          <button 
            onClick={onAnalyze}
            disabled={!videoFile || !comments || isAnalyzing || analysisComplete}
            className={`w-full flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all shadow-sm ${
              analysisComplete
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : !videoFile || !comments
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-primary hover:bg-violet-600 text-white shadow-primary/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                 <span className="material-symbols-outlined animate-spin">progress_activity</span>
                 분석 중...
              </>
            ) : analysisComplete ? (
              <>
                <span className="material-symbols-outlined">check</span>
                분석 완료
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">play_arrow</span>
                분석 시작
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;