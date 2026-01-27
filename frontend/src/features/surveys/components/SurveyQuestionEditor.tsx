import React from 'react';
import { SurveyQuestion } from '../types';
import { Trash2 } from 'lucide-react'; // 아이콘 라이브러리 (설치 필요: npm install lucide-react)

interface Props {
  index: number;
  question: SurveyQuestion;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export const SurveyQuestionEditor = ({ index, question, onChange, onRemove }: Props) => {
  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm relative group mb-6">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">설문 질문 {index + 1}</label>
        <input 
          type="text"
          className="w-full p-3 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
          placeholder="질문 내용을 입력해주세요"
          value={question.text}
          onChange={(e) => onChange(index, e.target.value)}
        />
      </div>

      {/* 5점 척도 비주얼 (관리자 확인용) */}
      <div className="flex justify-between items-center px-4 mt-4 select-none opacity-70">
        <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(num => (
            <div 
              key={num} 
              className={`w-12 h-10 border rounded flex items-center justify-center font-medium
                ${num === 3 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}
            >
              {num}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-500">매우 그렇다</span>
      </div>
      
      {/* 삭제 버튼 */}
      <button 
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};