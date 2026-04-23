import React, { useState } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import AnalysisDisplay from './components/AnalysisDisplay';
import MarkdownViewer from './components/MarkdownViewer';
import {
  analyzeVideo,
  generateStoryboard,
  generateImagePrompts,
} from './services/geminiService';
import { VideoAnalysisResult } from './types';

// Simplified steps for the UI tabs
enum TabStep {
  ANALYSIS = 1,
  STORYBOARD = 2,
  PROMPTS = 3,
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabStep>(TabStep.ANALYSIS);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [comments, setComments] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [storyboardMarkdown, setStoryboardMarkdown] = useState<string>('');
  const [imagePromptsMarkdown, setImagePromptsMarkdown] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const fileToGenericBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile || !comments) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = await fileToGenericBase64(videoFile);
      const result = await analyzeVideo(base64, videoFile.type, comments);
      setAnalysisResult(result);
      setActiveTab(TabStep.ANALYSIS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '분석에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!analysisResult) return;
    setIsGeneratingStoryboard(true);
    setError(null);

    try {
      // Parallel generation for speed in demo
      const [storyboard, prompts] = await Promise.all([
        generateStoryboard(analysisResult),
        generateImagePrompts(analysisResult, "Placeholder storyboard context") // In real app, chain these
      ]);
      
      setStoryboardMarkdown(storyboard);
      setImagePromptsMarkdown(prompts);
      setActiveTab(TabStep.STORYBOARD);
    } catch (err: any) {
      console.error(err);
      setError('스토리보드 생성에 실패했습니다.');
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  const renderTabContent = () => {
    if (!analysisResult) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
           <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-1 ring-slate-700">
              <span className="material-symbols-outlined text-[40px] text-primary">smart_display</span>
           </div>
           <h3 className="text-lg font-semibold text-slate-200 mb-2">분석 준비 완료</h3>
           <p className="text-sm max-w-xs text-center">왼쪽에서 비디오를 업로드하고 가이드라인을 입력하여 Gemini 분석을 시작하세요.</p>
        </div>
      );
    }

    switch (activeTab) {
      case TabStep.ANALYSIS:
        return (
          <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-slate-100">분석 결과</h2>
                   <p className="text-sm text-slate-400 mt-1">내러티브 구조, 템포, 시각적 톤을 심층 분석합니다.</p>
                </div>
                <button 
                  onClick={() => setActiveTab(TabStep.STORYBOARD)}
                  className="px-5 py-2 bg-slate-900 border border-slate-700 hover:border-primary/50 text-slate-300 font-medium rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  다음: 스토리보드
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
             </div>
             <AnalysisDisplay data={analysisResult} />
          </div>
        );
      
      case TabStep.STORYBOARD:
        const scenes = (analysisResult.video_analysis?.scenes && Array.isArray(analysisResult.video_analysis.scenes)) 
          ? analysisResult.video_analysis.scenes 
          : [];

        return (
          <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in pb-10">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">스토리보드 생성</h2>
                  <p className="text-sm text-slate-400 mt-1">분석된 씬을 검토하고 시각적 레퍼런스를 생성합니다.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-medium rounded-lg text-sm hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        설정
                    </button>
                    <button 
                      onClick={handleGenerateStoryboard}
                      disabled={isGeneratingStoryboard}
                      className="px-5 py-2 bg-primary hover:bg-violet-600 text-white font-bold rounded-lg text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isGeneratingStoryboard ? (
                          <>
                             <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                             생성 중...
                          </>
                        ) : (
                          <>
                             <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                             스토리보드 생성
                          </>
                        )}
                    </button>
                </div>
             </div>
             
             {/* Scene Grid from Analysis */}
             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {scenes.length > 0 ? (
                  scenes.map((scene, idx) => (
                   <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group duration-300">
                      <div className="aspect-video bg-slate-950 w-full border-b border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-900 transition-colors">
                          <div className="flex flex-col items-center gap-2">
                              <span className="material-symbols-outlined text-slate-700 text-4xl group-hover:scale-110 group-hover:text-primary/40 transition-all duration-300">image</span>
                              <p className="text-xs text-slate-600 font-medium">생성된 이미지 없음</p>
                          </div>
                      </div>
                      <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {scene.time_range}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">씬 {idx + 1}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-100 mb-1">{scene.scene_id}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed mb-5 line-clamp-3">
                              {scene.narrative_structure} | {scene.pacing}
                          </p>
                          <button 
                             className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-slate-400 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                             title="데모 버전에서는 일괄 생성만 지원합니다."
                          >
                              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                              비주얼 생성
                          </button>
                      </div>
                   </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                    <span className="material-symbols-outlined text-[40px] mb-2">error_outline</span>
                    <p>분석된 씬 정보가 없습니다.</p>
                  </div>
                )}
                
                {/* Manual Add Card */}
                <div className="bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-800 hover:border-primary/40 hover:bg-slate-900/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 p-8 min-h-[300px]">
                    <div className="size-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-slate-600 text-[24px]">add</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">수동으로 씬 추가</p>
                </div>
             </div>

             {/* Generated Markdown (if any) */}
             {storyboardMarkdown && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">생성된 큐시트</h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm overflow-hidden">
                       <MarkdownViewer content={storyboardMarkdown} />
                    </div>
                </div>
             )}
          </div>
        );

      case TabStep.PROMPTS:
        return (
          <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in pb-10">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-100">생성된 프롬프트</h2>
                <div className="flex gap-2">
                   <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-medium rounded-lg text-sm hover:bg-slate-800 transition-all">전체 복사</button>
                   <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg text-sm hover:bg-violet-600 transition-all">Veo로 내보내기</button>
                </div>
             </div>
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm min-h-[500px]">
                {imagePromptsMarkdown ? (
                  <div className="text-slate-300">
                    <MarkdownViewer content={imagePromptsMarkdown} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                     <p>프롬프트가 아직 생성되지 않았습니다. 스토리보드 탭에서 '생성'을 클릭하세요.</p>
                  </div>
                )}
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Sidebar 
        videoFile={videoFile}
        onFileChange={setVideoFile}
        comments={comments}
        onCommentsChange={setComments}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
        analysisComplete={!!analysisResult}
      />
      
      <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        {/* Step Navigation Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center gap-2 overflow-x-auto shadow-sm z-10">
            <button 
              onClick={() => analysisResult && setActiveTab(TabStep.ANALYSIS)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                analysisResult 
                  ? activeTab === TabStep.ANALYSIS ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-sm ring-1 ring-green-500/10' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
                <div className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${analysisResult ? 'bg-green-600 text-white' : 'border border-slate-700'}`}>
                    {analysisResult ? <span className="material-symbols-outlined text-[14px]">check</span> : '1'}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">영상 분석</span>
            </button>
            
            <span className="w-8 h-px bg-slate-800 shrink-0"></span>
            
            <button 
               onClick={() => analysisResult && setActiveTab(TabStep.STORYBOARD)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                 activeTab === TabStep.STORYBOARD
                    ? 'bg-primary/20 border-primary/30 text-primary shadow-sm ring-2 ring-primary/10'
                    : analysisResult ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800' : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
               }`}
            >
                <div className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${activeTab === TabStep.STORYBOARD ? 'bg-primary text-white' : 'border border-current'}`}>2</div>
                <span className="text-sm font-medium whitespace-nowrap">스토리보드</span>
            </button>
            
            <span className="w-8 h-px bg-slate-800 shrink-0"></span>
            
            <button 
               onClick={() => analysisResult && storyboardMarkdown && setActiveTab(TabStep.PROMPTS)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  activeTab === TabStep.PROMPTS
                    ? 'bg-primary/20 border-primary/30 text-primary shadow-sm ring-2 ring-primary/10'
                    : storyboardMarkdown ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800' : 'bg-slate-900 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
               }`}
            >
                <div className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${activeTab === TabStep.PROMPTS ? 'bg-primary text-white' : 'border border-current'}`}>3</div>
                <span className="text-sm font-medium whitespace-nowrap">프롬프트</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950">
           {error && (
              <div className="mb-6 bg-red-950/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
                 <span className="material-symbols-outlined">error</span>
                 <span>{error}</span>
              </div>
           )}
           {renderTabContent()}
        </div>
      </section>
    </Layout>
  );
};

export default App;