import React from 'react';

export const ProgressRing = ({ radius, stroke, progress, colorClass }: { radius: number; stroke: number; progress: number; colorClass: string }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={colorClass}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex items-center justify-center text-sm font-semibold text-slate-700">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export const BarChart = ({ data, maxVal }: { data: { label: string; value: number; colorClass?: string }[]; maxVal: number }) => {
  return (
    <div className="flex flex-col space-y-3 w-full">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center text-sm">
          <div className="w-24 truncate text-slate-600 font-medium pr-2" title={item.label}>{item.label}</div>
          <div className="flex-1 bg-slate-100 rounded-full h-4 relative">
            <div
              className={`absolute top-0 left-0 h-4 rounded-full ${item.colorClass || 'bg-blue-500'}`}
              style={{ width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%` }}
            />
          </div>
          <div className="w-12 text-right text-slate-700 font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export const Sparkline = ({ data, width, height, maxVal }: { data: number[]; width: number; height: number; maxVal: number }) => {
  if (data.length === 0) return <div className="text-slate-400 text-sm">Chưa đủ dữ liệu để hiển thị xu hướng.</div>;
  if (data.length === 1) return <div className="text-slate-400 text-sm">Cần thêm dữ liệu để hiển thị xu hướng.</div>;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - (maxVal > 0 ? (val / maxVal) * height : 0);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - (maxVal > 0 ? (val / maxVal) * height : 0);
        return <circle key={idx} cx={x} cy={y} r="3" fill="#3b82f6" stroke="white" strokeWidth="1" />;
      })}
    </svg>
  );
};
