import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🔄 Updating active session to 2025/2026...');
    
    // Set 2024/2025 as inactive
    await prisma.session.update({
      where: { name: '2024/2025' },
      data: { isActive: false }
    });
    
    // Set 2025/2026 as active
    await prisma.session.update({
      where: { name: '2025/2026' },
      data: { isActive: true }
    });
    
    console.log('✅ Session updated successfully!');
    
    // Verify the change
    const activeSession = await prisma.session.findFirst({
      where: { isActive: true }
    });
    
    return NextResponse.json({
      success: true,
      message: '2025/2026 is now the active session',
      activeSession: activeSession?.name
    });
    
  } catch (error) {
    console.error('❌ Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
