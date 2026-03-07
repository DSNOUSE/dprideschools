// Global type definitions for DPRIDE School System
// This file contains common types used across the application

declare global {
  // Common entity types
  interface Student {
    id: string;
    admissionNo: string;
    firstName: string;
    lastName: string;
    classId?: string;
    class?: {
      id: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  interface Class {
    id: string;
    name: string;
    level?: string;
    sort_order?: number;
    createdAt: string;
    updatedAt: string;
  }

  interface Report {
    id: string;
    studentId: string;
    subjectId?: string;
    grade: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Subject {
    id: string;
    name: string;
    code?: string;
    classId?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Grade {
    id: string;
    name: string;
    level?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Session {
    id: string;
    name: string;
    active?: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Term {
    id: string;
    name: string;
    sessionId?: string;
    active?: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Department {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Result {
    id: string;
    studentId: string;
    sessionId: string;
    termId: string;
    classId: string;
    average: number;
    grades: {
      subjectId: string;
      score: number;
      average: number;
    }[];
    createdAt: string;
    updatedAt: string;
  }

  // Common UI component props
  interface PortalCard {
    title: string;
    description: string;
    icon: string;
    href: string;
  }

  interface Announcement {
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    color: string;
  }

  interface FeeStructure {
    level: string;
    period: string;
    amount: string;
  }

  interface Policy {
    title: string;
    href: string;
  }

  // Map function types to prevent implicit any
  type MapFunction<T, R> = (item: T, index: number) => R;
  type MapCallback<T> = (item: T, index: number) => React.ReactNode;
}

export {};
