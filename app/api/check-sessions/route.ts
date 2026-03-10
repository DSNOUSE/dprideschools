import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Checking current sessions in database...');
    
    const sessions = await prisma.session.findMany({
      orderBy: { id: 'desc' }
    });
    
    console.log('📋 All sessions in database:');
    sessions.forEach(session => {
      console.log(`  - ${session.name} (Active: ${session.isActive})`);
    });
    
    const activeSession = await prisma.session.findFirst({
      where: { isActive: true }
    });
    
    console.log(`🎯 Current active session: ${activeSession?.name || 'None'}`);
    
    return NextResponse.json({
      sessions,
      activeSession: activeSession?.name || null
    });
    
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
