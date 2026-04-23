import React from 'react';
import { VideoAnalysisResult } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface AnalysisDisplayProps {
  data: VideoAnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data }) => {
  // Strict array checks to prevent crashes
  const scenes = (data?.video_analysis?.scenes && Array.isArray(data.video_analysis.scenes)) 
    ? data.video_analysis.scenes 
    : [];

  const chartData = scenes.map((scene, index) => {
    // Safety check for time_range format
    const parts = scene.time_range ? scene.time_range.split('-') : ['0', '0'];
    const start = parseFloat(parts[0]) || 0;
    const end = parseFloat(parts[1]) || 0;
    
    // Format index as 001, 002, etc.
    const sceneLabel = `씬${String(index + 1).padStart(3, '0')}`;
    
    return {
      name: sceneLabel,
      duration: Math.max(0, end - start),
      structure: scene.narrative_structure || '',
    };
  });

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

  const engagementMap = (data?.audience_insights?.engagement_map && Array.isArray(data.audience_insights.engagement_map))
    ? data.audience_insights.engagement_map
    : [];
    
  const narrativeAnchors = (data?.consistency_preservation?.narrative_anchors && Array.isArray(data.consistency_preservation.narrative_anchors))
    ? data.consistency_preservation.narrative_anchors
    : [];
    
  const lutPlan = data?.consistency_preservation?.lut_grading_plan || { base_tone: '-', suggested_adjustment: '-' };

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">재생 시간</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {data?.video_analysis?.duration_seconds || 0}초
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[20px]">theaters</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">총 씬 수</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {data?.video_analysis?.total_scenes || 0}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">핵심 순간</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {engagementMap.length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[20px]">anchor</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">내러티브 앵커</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {narrativeAnchors.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scene Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-6">
            씬별 지속 시간 분포
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#4b5563"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                  }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative & Consistency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6 overflow-y-auto max-h-[400px] custom-scrollbar">
          <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-4">
            상세 분석
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                내러티브 앵커 (유지 요소)
              </h4>
              <div className="flex flex-wrap gap-2">
                {narrativeAnchors.map(
                  (el, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700"
                    >
                      {el}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                색보정 & LUT 제안
              </h4>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-medium">기본 톤</span>
                  <span className="font-bold text-slate-200">{lutPlan.base_tone}</span>
                </div>
                <div className="text-slate-400 leading-relaxed">
                  {lutPlan.suggested_adjustment}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                시청자 반응 / 몰입 포인트
              </h4>
              <div className="space-y-3">
                {engagementMap
                  .slice(0, 3)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-200 font-medium text-sm mb-2">
                        {item.trigger_element}
                      </p>
                      <p className="text-slate-500 text-xs italic">
                        "{item.comment_reference}"
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;