import { GoogleGenAI, Type } from '@google/genai';
import {
  GEMINI_MODEL,
  SYSTEM_INSTRUCTION,
  PROMPT_ANALYSIS_TEMPLATE,
  PROMPT_STORYBOARD_TEMPLATE,
  PROMPT_IMAGE_GEN_TEMPLATE,
  PROMPT_FEEDBACK_TEMPLATE,
} from '../constants';
import { VideoAnalysisResult, FeedbackResult } from '../types';

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    // Vite Standard: Must use VITE_ prefix for client-side environment variables
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Vercel 환경 설정에서 VITE_GEMINI_API_KEY를 찾을 수 없습니다. (Settings -> Environment Variables 확인 필요)');
    }
    client = new GoogleGenAI(apiKey);
  }
  return client;
};

// Helper to strip markdown code blocks from LLM response
const cleanJsonString = (text: string): string => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present (handles optional language identifier and trailing whitespace)
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');
  }
  return cleanText.trim();
};

export const analyzeVideo = async (
  videoBase64: string,
  videoMimeType: string,
  comments: string,
): Promise<VideoAnalysisResult> => {
  const ai = getClient();
  const prompt = PROMPT_ANALYSIS_TEMPLATE.replace('{{COMMENTS}}', comments);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: videoMimeType,
            data: videoBase64,
          },
        },
        { text: prompt },
      ],
    },
  });

  const text = response.text || '{}';
  const cleanedText = cleanJsonString(text);

  try {
    const parsed = JSON.parse(cleanedText) as VideoAnalysisResult;

    // --- Fallback & Safety Checks ---
    if (!parsed.video_analysis) {
      parsed.video_analysis = {
        duration_seconds: 0,
        total_scenes: 0,
        scenes: [],
      };
    }

    // Ensure scenes is an array
    if (!Array.isArray(parsed.video_analysis.scenes)) {
       parsed.video_analysis.scenes = [];
    }

    // If scenes are missing/empty, create a fallback scene
    if (parsed.video_analysis.scenes.length === 0) {
      parsed.video_analysis.scenes = [
        {
          scene_id: 'SCENE_001_FALLBACK',
          time_range: '00:00 - End',
          narrative_structure: '전체 통합 분석 (세부 씬 구분 실패)',
          pacing: '보통',
          emotional_arc: '분석된 감정 데이터 없음',
          character_acting_guide: 'N/A',
          visual_details: '영상 전체의 시각적 분위기를 기반으로 생성됩니다.',
        },
      ];
    }

    // Fill other missing sections to prevent UI crashes
    if (!parsed.audience_insights) {
      parsed.audience_insights = { engagement_map: [] };
    }
    if (!parsed.consistency_preservation) {
      parsed.consistency_preservation = {
        narrative_anchors: ['기본 내러티브 유지'],
        lut_grading_plan: {
          base_tone: 'Standard',
          suggested_adjustment: 'None',
        },
      };
    }

    return parsed;
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('AI 응답을 처리하는 중 오류가 발생했습니다. (JSON Parsing Error)');
  }
};

export const generateStoryboard = async (
  analysisJson: VideoAnalysisResult,
): Promise<string> => {
  const ai = getClient();
  const jsonString = JSON.stringify(analysisJson, null, 2);
  const prompt = PROMPT_STORYBOARD_TEMPLATE.replace(
    '{{JSON_ANALYSIS}}',
    jsonString,
  );

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    contents: {
      parts: [{ text: prompt }],
    },
  });

  return response.text || '';
};

export const generateImagePrompts = async (
  analysisJson: VideoAnalysisResult,
  storyboard: string,
): Promise<string> => {
  const ai = getClient();
  const jsonString = JSON.stringify(analysisJson, null, 2);
  const prompt = PROMPT_IMAGE_GEN_TEMPLATE.replace(
    '{{JSON_ANALYSIS}}',
    jsonString,
  ).replace('{{STORYBOARD}}', storyboard);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    contents: {
      parts: [{ text: prompt }],
    },
  });

  return response.text || '';
};

export const generateFeedback = async (
  videoBase64: string,
  videoMimeType: string,
  analysisJson: VideoAnalysisResult,
): Promise<FeedbackResult> => {
  const ai = getClient();
  const jsonString = JSON.stringify(analysisJson, null, 2);
  const prompt = PROMPT_FEEDBACK_TEMPLATE.replace(
    '{{JSON_ANALYSIS}}',
    jsonString,
  );

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consistency_score: { type: Type.NUMBER },
          quality_assessment: {
            type: Type.OBJECT,
            properties: {
              visual_fidelity: { type: Type.STRING },
              narrative_flow_match: { type: Type.STRING },
              pacing_match: { type: Type.STRING },
              color_grading_match: { type: Type.STRING },
            },
          },
          detailed_feedback: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          outlier_check: {
            type: Type.OBJECT,
            properties: {
              is_exceptional: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
            },
          },
          refined_prompt_suggestion: { type: Type.STRING },
        },
      },
    },
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: videoMimeType,
            data: videoBase64,
          },
        },
        { text: prompt },
      ],
    },
  });

  const text = response.text || '{}';
  const cleanedText = cleanJsonString(text);
  return JSON.parse(cleanedText) as FeedbackResult;
};