import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllLoansWithFallback } from '@/lib/db-fallback';
import { mockLoanRecords } from '@/lib/mock-db';

// Define valid loan statuses
type LoanStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';

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
    console.log('Received loan creation request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.clientName || !body.idNumber || !body.phoneNumber1 || !body.businessLocation || !body.homeAddress) {
      console.error('Missing required client fields');
      return NextResponse.json({ error: 'Missing required client fields' }, { status: 400 });
    }
    
    if (!body.loanAmount || !body.interestRate || !body.loanDuration) {
      console.error('Missing required loan fields');
      return NextResponse.json({ error: 'Missing required loan fields' }, { status: 400 });
    }
    
    // Check if client with this ID already exists
    const existingClient = await prisma.client.findUnique({
      where: { idNumber: body.idNumber },
    });
    
    let client;
    if (existingClient) {
      console.log(`Client with ID ${body.idNumber} already exists, using existing client`);
      client = existingClient;
    } else {
      // Create client first
      console.log('Creating new client...');
      client = await prisma.client.create({
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
      console.log('Client created successfully:', client.id);
    }

    // Create loan record
    console.log('Creating loan record...');
    
    // Ensure numeric values are properly converted
    const loanAmount = typeof body.loanAmount === 'string' ? parseFloat(body.loanAmount) : body.loanAmount;
    const interestRate = typeof body.interestRate === 'string' ? parseFloat(body.interestRate) : body.interestRate;
    const registrationFee = typeof body.registrationFee === 'string' ? parseFloat(body.registrationFee) : (body.registrationFee || 0);
    const loanDuration = typeof body.loanDuration === 'string' ? parseInt(body.loanDuration) : body.loanDuration;
    
    // Validate status is one of the allowed values
    const validStatuses: LoanStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'DEFAULTED'];
    const status = validStatuses.includes(body.status as LoanStatus) ? body.status as LoanStatus : 'PENDING';
    
    console.log('Loan data to be created:', {
      clientId: client.id,
      loanAmount,
      interestRate,
      registrationFee,
      loanDuration,
      status
    });
    
    let loanRecord;
    try {
      loanRecord = await prisma.loanRecord.create({
        data: {
          clientId: client.id,
          loanAmount,
          interestRate,
          registrationFee,
          loanDuration,
          applicationDate: new Date(body.applicationDate),
          disbursementDate: body.disbursementDate ? new Date(body.disbursementDate) : null,
          firstInstallmentDate: body.firstInstallmentDate ? new Date(body.firstInstallmentDate) : null,
          lastInstallmentDate: body.lastInstallmentDate ? new Date(body.lastInstallmentDate) : null,
          dailyPaymentCheck: body.dailyPaymentCheck || false,
          loanOfficer: body.loanOfficer,
          status,
        },
      });
      
      console.log('Loan record created successfully:', loanRecord.id);
    } catch (error) {
      console.error('Error creating loan record:', error);
      return NextResponse.json({ 
        error: 'Failed to create loan record', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }

    // Create guarantors if provided
    if (body.guarantors && body.guarantors.length > 0) {
      try {
        console.log('Creating guarantors...');
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
        console.log('Guarantors created successfully');
      } catch (error) {
        console.error('Error creating guarantors:', error);
        // Continue with the process even if guarantors fail
      }
    }

    // Create references if provided
    if (body.references && body.references.length > 0) {
      try {
        console.log('Creating references...');
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
        console.log('References created successfully');
      } catch (error) {
        console.error('Error creating references:', error);
        // Continue with the process even if references fail
      }
    }

    // Create media files if provided
    if (body.mediaFiles && body.mediaFiles.length > 0) {
      try {
        console.log('Creating media files...');
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
        console.log('Media files created successfully');
      } catch (error) {
        console.error('Error creating media files:', error);
        // Continue with the process even if media files fail
      }
    }

    // Fetch the newly created loan to verify it exists in the database
    try {
      const createdLoan = await prisma.loanRecord.findUnique({
        where: { id: loanRecord.id },
        include: { client: true }
      });
      
      if (!createdLoan) {
        console.error('Loan was created but could not be retrieved');
      } else {
        console.log('Successfully verified loan creation:', createdLoan.id);
      }
    } catch (verifyError) {
      console.error('Error verifying loan creation:', verifyError);
    }

    return NextResponse.json(
      { 
        message: 'Loan record created successfully', 
        loanId: loanRecord.id,
        clientId: client.id,
        status: loanRecord.status
      },
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
