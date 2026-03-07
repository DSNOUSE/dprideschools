import * as React from 'react';

type GridProps = {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-8',
};

const colClasses = {
  1: 'grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
  6: 'md:grid-cols-3 lg:grid-cols-6',
  12: 'md:grid-cols-6 lg:grid-cols-12',
};

export default function Grid({ children, cols = 2, gap = 'md', className = '' }: GridProps) {
  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
