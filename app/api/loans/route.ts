import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LoanStatus } from '@prisma/client';
import { getAllLoansWithFallback } from '@/lib/db-fallback';
import { mockLoanRecords } from '@/lib/mock-db';

// GET all loans
export async function GET() {
  try {
    // Use the fallback system to get loans
    const loans = await getAllLoansWithFallback(prisma);
    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    // If all else fails, return mock data directly
    return NextResponse.json(mockLoanRecords);
  }
}

// POST a new loan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create client first
    const client = await prisma.client.create({
      data: {
        name: body.clientName,
        idNumber: body.idNumber,
        phoneNumber1: body.phoneNumber1,
        phoneNumber2: body.phoneNumber2 || null,
        businessLocation: body.businessLocation,
        permitNumber: body.permitNumber || null,
        homeAddress: body.homeAddress,
      },
    });

    // Create loan record
    const loanRecord = await prisma.loanRecord.create({
      data: {
        clientId: client.id,
        loanAmount: parseFloat(body.loanAmount),
        interestRate: parseFloat(body.interestRate),
        registrationFee: parseFloat(body.registrationFee),
        loanDuration: parseInt(body.loanDuration),
        applicationDate: new Date(body.applicationDate),
        disbursementDate: body.disbursementDate ? new Date(body.disbursementDate) : null,
        firstInstallmentDate: body.firstInstallmentDate ? new Date(body.firstInstallmentDate) : null,
        lastInstallmentDate: body.lastInstallmentDate ? new Date(body.lastInstallmentDate) : null,
        dailyPaymentCheck: body.dailyPaymentCheck || false,
        loanOfficer: body.loanOfficer,
        status: body.status as LoanStatus || 'PENDING',
      },
    });

    // Create guarantors if provided
    if (body.guarantors && body.guarantors.length > 0) {
      await Promise.all(
        body.guarantors.map((guarantor: any) =>
          prisma.guarantor.create({
            data: {
              name: guarantor.name,
              idNumber: guarantor.idNumber,
              phoneNumber: guarantor.phoneNumber,
              clientId: client.id,
              loanRecordId: loanRecord.id,
            },
          })
        )
      );
    }

    // Create references if provided
    if (body.references && body.references.length > 0) {
      await Promise.all(
        body.references.map((reference: any) =>
          prisma.reference.create({
            data: {
              name: reference.name,
              phoneNumber: reference.phoneNumber,
              relationship: reference.relationship,
              clientId: client.id,
              loanRecordId: loanRecord.id,
            },
          })
        )
      );
    }

    // Create media files if provided
    if (body.mediaFiles && body.mediaFiles.length > 0) {
      await Promise.all(
        body.mediaFiles.map((file: any) =>
          prisma.mediaFile.create({
            data: {
              fileName: file.fileName,
              fileType: file.fileType === 'application/pdf' ? 'CONTRACT_PDF' : 'OTHER_DOCUMENT',
              fileUrl: file.fileUrl,
              description: file.description || null,
              clientId: client.id,
              loanRecordId: loanRecord.id,
            },
          })
        )
      );
    }

    return NextResponse.json(
      { message: 'Loan record created successfully', loanId: loanRecord.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating loan:', error);
    // Return a more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create loan record';
    return NextResponse.json(
      { 
        error: 'Failed to create loan record', 
        details: errorMessage,
        fallbackMessage: 'Database connection issues detected. Please try again later.'
      },
      { status: 500 }
    );
  }
}
