// src/components/charts/PerformanceComparisonChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PerformanceComparisonChart = ({ data }) => {
  if (!data) {
    return <div className="text-center text-slate-500">Analiz verileri yükleniyor...</div>;
  }

  const chartData = [
    {
      name: 'Referanslar',
      'Senin': data.myReferrals,
      'Ortalama': data.averageReferrals,
      'En İyi': data.topReferrals,
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-center font-semibold text-slate-900 mb-4">Rakip Karşılaştırma</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#1f2937' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
            iconType="square"
          />
          <Bar dataKey="Senin" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Ortalama" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="En İyi" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceComparisonChart;
