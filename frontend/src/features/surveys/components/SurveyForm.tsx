"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyQuestion, SurveyCreateRequest } from '../types';
import { DEFAULT_WEIGHTS } from '../constants';
import { surveyClient } from '../service/surveys.client';
import { SurveyQuestionEditor } from './SurveyQuestionEditor';
import { PlusCircle } from 'lucide-react';

export const SurveyForm = () => {
  const router = useRouter();
  
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    semesterId: 202601,
    startAt: '2026-03-01T09:00',
    endAt: '2026-03-31T18:00'
  });

  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { text: '', type: 'SCALE', weights: { ...DEFAULT_WEIGHTS } }
  ]);

  const handleSubmit = async () => {
    try {
      const payload: SurveyCreateRequest = {
        ...basicInfo,
        questions: questions.map((q, idx) => ({ ...q, order: idx + 1 }))
      };
      await surveyClient.create(payload);
      alert('등록되었습니다.');
      router.push('/admin/surveys');
    } catch (err) {
      alert('등록 실패');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'SCALE', weights: { ...DEFAULT_WEIGHTS } }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
      {/* 1. 기본 정보 입력 */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <input 
          type="text" 
          placeholder="설문 제목을 입력하세요"
          className="text-2xl font-bold w-full focus:outline-none placeholder-gray-300"
          value={basicInfo.title}
          onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
        />
        <select className="border p-2 rounded ml-4 text-sm min-w-[100px]">
          <option>교과</option>
          <option>비교과</option>
        </select>
      </div>

      {/* 2. 문항 리스트 */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <SurveyQuestionEditor 
            key={idx}
            index={idx}
            question={q}
            onChange={handleQuestionChange}
            onRemove={handleRemoveQuestion}
          />
        ))}

        {/* 문항 추가 버튼 */}
        <div 
          onClick={handleAddQuestion}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition text-gray-400 hover:text-blue-500"
        >
          <PlusCircle size={32} className="mb-2" />
          <span className="font-medium">문항 추가하기</span>
        </div>
      </div>

      {/* 3. 하단 버튼 */}
      <div className="flex justify-end gap-3 mt-10 pt-4 border-t">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
        >
          취소
        </button>
        <button 
          onClick={handleSubmit} 
          className="px-6 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm"
        >
          등록
        </button>
      </div>
    </div>
  );
};