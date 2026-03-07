import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      childName,
      childAge,
      preferredDate,
      preferredTime,
      visitType,
      message
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !childName || !childAge || !preferredDate || !preferredTime || !visitType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const visitDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visitDate < today) {
      return NextResponse.json(
        { error: 'Preferred date cannot be in the past' },
        { status: 400 }
      );
    }

    // Create booking record (you might want to create a database table for this)
    // For now, we'll just log and return success
    const bookingData = {
      firstName,
      lastName,
      email,
      phone,
      childName,
      childAge,
      preferredDate,
      preferredTime,
      visitType,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Log the booking (in production, you'd save to database)
    console.log('New visit booking:', bookingData);

    // TODO: Send email notification to school admin
    // TODO: Send confirmation email to parent
    // TODO: Save to database when booking table is created

    return NextResponse.json(
      { 
        message: 'Visit booking submitted successfully! We will contact you within 24 hours to confirm your appointment.',
        bookingId: `BK${Date.now()}`
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing visit booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This could be used by admin to view all bookings
    // For now, return a simple response
    return NextResponse.json({
      message: 'Visit booking API is active',
      availableTimes: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
      visitTypes: [
        { value: 'general', label: 'General School Tour' },
        { value: 'classroom', label: 'Classroom Observation' },
        { value: 'meeting', label: 'Meeting with Principal' },
        { value: 'assessment', label: 'Assessment & Enrollment' }
      ]
    });
  } catch (error) {
    console.error('Error fetching booking info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking information' },
      { status: 500 }
    );
  }
}
