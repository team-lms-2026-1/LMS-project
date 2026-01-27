"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// 실제로는 props로 데이터를 받아야 하지만 예시 데이터 사용
const DATA = [
  { name: '매우 만족', value: 35, color: '#BAE1FF' },
  { name: '만족', value: 20, color: '#FFDFBA' },
  { name: '보통', value: 15, color: '#BAFFC9' },
  { name: '불만족', value: 10, color: '#FFFFBA' },
  { name: '매우 불만족', value: 10, color: '#FFB3BA' },
];

export const SurveyResultSummary = () => {
  return (
    <div className="bg-white p-10 rounded shadow-sm border flex flex-col items-center">
      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {DATA.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-8 h-4 rounded-sm" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm text-gray-600 font-medium">{entry.name}</span>
          </div>
        ))}
      </div>

      {/* 도넛 차트 */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
            >
              {DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};