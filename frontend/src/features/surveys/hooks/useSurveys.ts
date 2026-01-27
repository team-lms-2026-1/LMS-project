import { useState, useEffect, useCallback } from 'react';
import { surveyClient } from '../service/surveys.client';
import { SurveyListResponse } from '../types';

export const useSurveys = () => {
  const [surveys, setSurveys] = useState<SurveyListResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await surveyClient.getList(page);
      // 백엔드 응답 구조에 맞춰 조정 필요 (res.content 등)
      setSurveys(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch surveys", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const deleteSurvey = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await surveyClient.delete(id);
        alert('삭제되었습니다.');
        fetchSurveys(); // 목록 갱신
      } catch (error) {
        alert('삭제 실패: 참여자가 있거나 오류가 발생했습니다.');
      }
    }
  };

  return { surveys, page, setPage, totalPages, loading, deleteSurvey };
};