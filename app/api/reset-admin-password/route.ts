import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json({ error: 'New password required' }, { status: 400 });
    }

    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@dprideschools.com' }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Hash new password
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      parallelism: 1,
      hashLength: 32,
    });

    // Update admin user password
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash }
    });

    console.log('✅ Admin password updated successfully');

    return NextResponse.json({
      message: 'Admin password reset successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
