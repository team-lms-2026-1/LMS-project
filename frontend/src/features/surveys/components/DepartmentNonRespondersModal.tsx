// src/features/surveys/components/DepartmentNonRespondersModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react'; // 아이콘

interface NonResponder {
  studentId: number;
  name: string;
  department: string;
  studentNumber: string; // 학번
  email: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surveyTitle: string;
  // 실제로는 API로 불러오겠지만, 예시를 위해 props로 받거나 내부에서 fetch 가능
  nonResponders?: NonResponder[]; 
}

// 예시 데이터 (API 연동 전 테스트용)
const MOCK_DATA: NonResponder[] = [
  { studentId: 1, name: '김철수', department: '컴퓨터공학과', studentNumber: '20201234', email: 'kim@test.com' },
  { studentId: 2, name: '이영희', department: '컴퓨터공학과', studentNumber: '20205678', email: 'lee@test.com' },
  { studentId: 3, name: '박민수', department: '전자공학과', studentNumber: '20211111', email: 'park@test.com' },
];

export const DepartmentNonRespondersModal = ({ isOpen, onClose, surveyTitle, nonResponders = MOCK_DATA }: Props) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  if (!isOpen) return null;

  // 학과 목록 추출 (필터링용)
  const departments = ['ALL', ...Array.from(new Set(nonResponders.map(s => s.department)))];

  // 필터링된 목록
  const filteredList = selectedDept === 'ALL' 
    ? nonResponders 
    : nonResponders.filter(s => s.department === selectedDept);

  const handleSendReminder = () => {
    if (confirm(`${filteredList.length}명의 학생에게 독려 메일을 발송하시겠습니까?`)) {
      // TODO: API 호출 (surveyClient.sendReminder 등)
      alert('발송되었습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">미응답자 관리</h2>
            <p className="text-xs text-gray-500 mt-1">{surveyTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* 상단 필터 및 액션 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">학과 필터:</span>
              <select 
                className="border rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'ALL' ? '전체 학과' : dept}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              총 <span className="font-bold text-red-500">{filteredList.length}</span>명 미응답
            </div>
          </div>

          {/* 테이블 */}
          <div className="border rounded-lg overflow-hidden h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">학과</th>
                  <th className="px-4 py-3 font-medium">학번</th>
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">이메일</th>
                  <th className="px-4 py-3 text-center font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400">
                      미응답자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((student) => (
                    <tr key={student.studentId} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-800">{student.department}</td>
                      <td className="px-4 py-3 text-gray-500">{student.studentNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                      <td className="px-4 py-3 text-gray-500">{student.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          <AlertCircle size={12} /> 미응시
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-100 transition"
          >
            닫기
          </button>
          <button 
            onClick={handleSendReminder}
            disabled={filteredList.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <Mail size={16} />
            독려 메일 발송
          </button>
        </div>
      </div>
    </div>
  );
};