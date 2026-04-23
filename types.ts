export interface SceneAnalysis {
  scene_id: string;
  time_range: string;
  narrative_structure: string;
  pacing: string;
  emotional_arc: string;
  character_acting_guide: string;
  visual_details: string;
}

export interface VideoAnalysisResult {
  video_analysis: {
    duration_seconds: number;
    total_scenes: number;
    scenes: SceneAnalysis[];
  };
  audience_insights: {
    engagement_map: Array<{
      timestamp: string;
      trigger_element: string;
      comment_reference: string;
    }>;
  };
  consistency_preservation: {
    narrative_anchors: string[];
    lut_grading_plan: {
      base_tone: string;
      suggested_adjustment: string;
    };
  };
}

export interface FeedbackResult {
  consistency_score: number;
  quality_assessment: {
    visual_fidelity: 'High' | 'Medium' | 'Low';
    narrative_flow_match: 'High' | 'Medium' | 'Low';
    pacing_match: 'High' | 'Medium' | 'Low';
    color_grading_match: 'High' | 'Medium' | 'Low';
  };
  detailed_feedback: string[];
  outlier_check: {
    is_exceptional: boolean;
    reason: string;
  };
  refined_prompt_suggestion?: string;
}

export enum AppStep {
  INPUT = 0,
  ANALYZING = 1,
  ANALYSIS_RESULT = 2,
  GENERATING_STORYBOARD = 3,
  STORYBOARD_RESULT = 4,
  GENERATING_PROMPTS = 5,
  FINAL_RESULT = 6,
  FEEDBACK_INPUT = 7,
  FEEDBACK_ANALYZING = 8,
  FEEDBACK_RESULT = 9,
}