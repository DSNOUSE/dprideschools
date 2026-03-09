"use client";

import React from 'react';
import { MenuBook, School, Person, Group } from '@mui/icons-material';

type Recent = { id: string; name: string; role?: string; when?: string };

export default function RightSidebar({ studentsCount, teachersCount, staffCount, recent = [] } : { studentsCount: number; teachersCount: number; staffCount: number; recent?: Recent[] }) {
  return (
    <aside className="space-y-4">
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Today's Attendance</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MenuBook sx={{ fontSize: 28, color: '#1e40af' }} />
              <div>
                <div className="text-xs text-gray-500">Students</div>
                <div className="font-bold">{studentsCount}</div>
              </div>
            </div>
            <div className="text-sm text-green-600">Present</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <School sx={{ fontSize: 28, color: '#b45309' }} />
              <div>
                <div className="text-xs text-gray-500">Teachers</div>
                <div className="font-bold">{teachersCount}</div>
              </div>
            </div>
            <div className="text-sm text-amber-600">Present</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Person sx={{ fontSize: 28, color: '#06b6d4' }} />
              <div>
                <div className="text-xs text-gray-500">Staff</div>
                <div className="font-bold">{staffCount}</div>
              </div>
            </div>
            <div className="text-sm text-cyan-600">Present</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Recent Attendance</div>
        <div className="mt-3 space-y-2">
          {recent.length ? recent.map(r => (
            <div key={r.id} className="flex items-center gap-3">
              <Person sx={{ fontSize: 28, color: '#6b7280' }} />
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.role} • {r.when}</div>
              </div>
            </div>
          )) : <div className="text-sm text-gray-500">No recent attendance</div>}
        </div>
      </div>
    </aside>
  );
}
