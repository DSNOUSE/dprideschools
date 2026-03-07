import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
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

    // Create contact message record
    const contactData = {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Log the contact message (in production, you'd save to database)
    console.log('New contact message:', contactData);

    // TODO: Send email notification to school admin
    // TODO: Send confirmation email to sender
    // TODO: Save to database when contact table is created

    return NextResponse.json(
      { 
        message: 'Message sent successfully! We will get back to you within 24 hours.',
        messageId: `MSG${Date.now()}`
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This could be used by admin to view all contact messages
    // For now, return contact information
    return NextResponse.json({
      message: 'Contact API is active',
      contactInfo: {
        phone: '+234 800 000 0000',
        email: 'office@dprideschools.com',
        address: 'No. 30B Oke Agbe Close, Off Ladoke Akintola Boulevard, Garki II, Abuja',
        officeHours: {
          weekdays: '8:00 AM - 4:00 PM',
          saturday: '9:00 AM - 1:00 PM',
          sunday: 'Closed'
        }
      },
      subjects: [
        { value: 'admissions', label: 'Admissions Inquiry' },
        { value: 'academic', label: 'Academic Information' },
        { value: 'fees', label: 'Fee Information' },
        { value: 'general', label: 'General Inquiry' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'other', label: 'Other' }
      ]
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact information' },
      { status: 500 }
    );
  }
}
