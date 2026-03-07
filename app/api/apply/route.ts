import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const {
      // Student Information
      firstName,
      lastName,
      middleName,
      birthDate,
      sex,
      nationality,
      religion,
      
      // Parent/Guardian Information
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      parentOccupation,
      parentAddress,
      
      // Academic Information
      previousSchool,
      previousClass,
      applyingForClass,
      admissionDate,
      
      // Medical Information
      medicalConditions,
      allergies,
      emergencyContact,
      emergencyPhone,
      
      // Additional Information
      reasonForChoosing,
      specialNeeds,
      howDidYouHear,
      
      // Terms
      agreeToTerms
    } = body;

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'birthDate', 'sex', 'nationality', 'religion',
      'parentFirstName', 'parentLastName', 'parentEmail', 'parentPhone', 'parentOccupation', 'parentAddress',
      'applyingForClass', 'admissionDate', 'emergencyContact', 'emergencyPhone'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate admission date is not in the past
    const admDate = new Date(admissionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (admDate < today) {
      return NextResponse.json(
        { error: 'Admission date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Generate application number
    const applicationNo = `APP${Date.now()}`;

    // Create application record
    const application = {
      applicationNo,
      studentInfo: {
        firstName,
        lastName,
        middleName,
        birthDate,
        sex,
        nationality,
        religion
      },
      parentInfo: {
        firstName: parentFirstName,
        lastName: parentLastName,
        email: parentEmail,
        phone: parentPhone,
        occupation: parentOccupation,
        address: parentAddress
      },
      academicInfo: {
        previousSchool,
        previousClass,
        applyingForClass,
        admissionDate
      },
      medicalInfo: {
        medicalConditions,
        allergies,
        emergencyContact,
        emergencyPhone
      },
      additionalInfo: {
        reasonForChoosing,
        specialNeeds,
        howDidYouHear
      },
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Log the application (in production, you'd save to database)
    console.log('New student application:', application);

    // TODO: Send email notification to school admin
    // TODO: Send confirmation email to parent
    // TODO: Save to database when application table is created
    // TODO: Generate and send application receipt

    return NextResponse.json(
      { 
        message: 'Application submitted successfully! Your application number is ' + applicationNo + '. We will contact you within 3-5 working days for the next steps.',
        applicationNo,
        status: 'pending'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  try {
    // This could be used by admin to view all applications
    // For now, return application information
    return NextResponse.json({
      message: 'Student application API is active',
      availableClasses: [
        'Pre-Nursery (Discovery Class)',
        'Nursery 1',
        'Nursery 2',
        'Kindergarten 1',
        'Kindergarten 2',
        'Primary 1',
        'Primary 2',
        'Primary 3',
        'Primary 4',
        'Primary 5',
        'Junior Secondary 1',
        'Junior Secondary 2',
        'Junior Secondary 3'
      ],
      applicationSteps: [
        'Student Information',
        'Parent/Guardian Information', 
        'Academic Information',
        'Additional Information'
      ],
      requiredDocuments: [
        'Birth Certificate',
        'Previous School Records (if applicable)',
        'Immunization Records',
        'Passport Photograph (2 copies)',
        'Parent/Guardian ID'
      ]
    });
  } catch (error) {
    console.error('Error fetching application info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application information' },
      { status: 500 }
    );
  }
}
