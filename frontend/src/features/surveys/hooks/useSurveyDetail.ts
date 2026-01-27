// src/features/surveys/hooks/useSurveyDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { surveyClient } from '../service/surveys.client';
import { SurveyCreateRequest } from '../types'; 
// SurveyCreateRequest는 상세 조회 응답값과 구조가 유사하다고 가정 (Form 초기값용)

export const useSurveyDetail = (surveyId: number | string | null) => {
  const [survey, setSurvey] = useState<SurveyCreateRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      // API 호출 (문항 정보 포함된 상세 데이터)
      const data = await surveyClient.getDetail(Number(surveyId));
      setSurvey(data);
    } catch (err) {
      console.error(err);
      setError("진단 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { survey, loading, error, refetch: fetchDetail };
};