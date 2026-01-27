import axios from 'axios';
import { SURVEY_API_URL } from '../constants';
import { SurveyCreateRequest, SurveyListResponse } from '../types';

export const surveyClient = {
  // 목록 조회
  getList: async (page = 0, size = 10) => {
    const { data } = await axios.get(SURVEY_API_URL, { 
      params: { page, size } 
    });
    return data; // Expected: { content: SurveyListResponse[], totalPages: number }
  },

  // 상세 조회
  getDetail: async (id: number) => {
    const { data } = await axios.get(`${SURVEY_API_URL}/${id}`);
    return data;
  },

  // 등록
  create: async (payload: SurveyCreateRequest) => {
    const { data } = await axios.post(SURVEY_API_URL, payload);
    return data;
  },

  // 삭제
  delete: async (id: number) => {
    const { data } = await axios.delete(`${SURVEY_API_URL}/${id}`);
    return data;
  },
  
  // 통계 조회
  getStats: async (id: number) => {
    const { data } = await axios.get(`${SURVEY_API_URL}/${id}/report`);
    return data;
  }
};