"use client";

import React from 'react';

type Props = {
  data: number[];
  color?: string;
  height?: number;
  label?: string;
};

export default function AttendanceLineChart({ data, color = '#10b981', height = 120, label }: Props) {
  const width = 600;
  const padding = 8;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - (v / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="p-4 bg-white rounded shadow">
      {label && <div className="text-sm text-gray-600 mb-2">{label}</div>}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <polygon points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`} fill="url(#g1)" opacity={0.9} />
      </svg>
    </div>
  );
}
