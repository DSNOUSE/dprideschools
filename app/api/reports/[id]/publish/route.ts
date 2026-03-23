import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    // Get the current report
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Toggle the status
    const newStatus = report.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ 
      message: `Report ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`,
      status: newStatus 
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
}
