import { NextResponse } from 'next/server';

// Mock data for testing without database
const mockSessions = [
  { id: 1, name: '2024/2025', isActive: false },
  { id: 2, name: '2025/2026', isActive: true }
];

export async function GET() {
  try {
    return NextResponse.json(mockSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
