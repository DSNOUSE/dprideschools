'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarToday, Description, Payment, DateRange } from '@mui/icons-material';

const QuickLinks: React.FC = () => {
  const quickLinks = [
    {
      title: 'TERM DATES',
      href: '/calendar',
      icon: <DateRange sx={{ fontSize: 20, color: '#ffffffff' }} />,
      description: 'Academic calendar'
    },
    {
      title: 'CALENDAR',
      href: '/calendar',
      icon: <CalendarToday sx={{ fontSize: 20, color: '#ffffffff' }} />,
      description: 'School events'
    },
    {
      title: 'GENERAL LETTERS',
      href: '/letters',
      icon: <Description sx={{ fontSize: 20, color: '#ffffffff' }} />,
      description: 'Official communications'
    },
    
  ];

  return (
    <div className="fixed right-0 top-[calc(50%-100px)] transform -translate-y-1/2 z-30 hidden lg:block">
      <div className="backdrop-blur-sm rounded-l-lg shadow-2xl">
        <div className="py-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-all duration-300 border-l-4 border-transparent hover:border-amber-500"
            >
              <div className="flex-shrink-0">
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors duration-300">
                  {link.title}
                </div>
                <div className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-300">
                  {link.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Vertical accent line */}
        {/* <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-600 rounded-l-lg"></div> */}
      </div>
    </div>
  );
};

export default QuickLinks;
