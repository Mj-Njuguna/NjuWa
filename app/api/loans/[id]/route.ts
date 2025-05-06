import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LoanStatus } from '@prisma/client';

// GET a specific loan by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id;

    const loan = await prisma.loanRecord.findUnique({
      where: { id: loanId },
      include: {
        client: true,
        guarantors: true,
        references: true,
        mediaFiles: true,
      },
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan record' },
      { status: 500 }
    );
  }
}

// UPDATE a specific loan by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id;
    const body = await request.json();

    // Check if loan exists
    const existingLoan = await prisma.loanRecord.findUnique({
      where: { id: loanId },
      include: { client: true },
    });

    if (!existingLoan) {
      return NextResponse.json(
        { error: 'Loan record not found' },
        { status: 404 }
      );
    }

    // Update client information
    if (body.clientName || body.idNumber || body.phoneNumber1 || body.businessLocation || body.homeAddress) {
      await prisma.client.update({
        where: { id: existingLoan.clientId },
        data: {
          name: body.clientName || undefined,
          idNumber: body.idNumber || undefined,
          phoneNumber1: body.phoneNumber1 || undefined,
          phoneNumber2: body.phoneNumber2 || undefined,
          businessLocation: body.businessLocation || undefined,
          permitNumber: body.permitNumber || undefined,
          homeAddress: body.homeAddress || undefined,
        },
      });
    }

    // Update loan record
    const updatedLoan = await prisma.loanRecord.update({
      where: { id: loanId },
      data: {
        loanAmount: body.loanAmount ? parseFloat(body.loanAmount) : undefined,
        interestRate: body.interestRate ? parseFloat(body.interestRate) : undefined,
        registrationFee: body.registrationFee ? parseFloat(body.registrationFee) : undefined,
        loanDuration: body.loanDuration ? parseInt(body.loanDuration) : undefined,
        applicationDate: body.applicationDate ? new Date(body.applicationDate) : undefined,
        disbursementDate: body.disbursementDate ? new Date(body.disbursementDate) : undefined,
        firstInstallmentDate: body.firstInstallmentDate ? new Date(body.firstInstallmentDate) : undefined,
        lastInstallmentDate: body.lastInstallmentDate ? new Date(body.lastInstallmentDate) : undefined,
        dailyPaymentCheck: typeof body.dailyPaymentCheck === 'boolean' ? body.dailyPaymentCheck : undefined,
        loanOfficer: body.loanOfficer || undefined,
        status: body.status as LoanStatus || undefined,
      },
    });

    // Update guarantors if provided
    if (body.guarantors && body.guarantors.length > 0) {
      // Delete existing guarantors
      await prisma.guarantor.deleteMany({
        where: { loanRecordId: loanId },
      });

      // Create new guarantors
      await Promise.all(
        body.guarantors.map((guarantor: any) =>
          prisma.guarantor.create({
            data: {
              name: guarantor.name,
              idNumber: guarantor.idNumber,
              phoneNumber: guarantor.phoneNumber,
              clientId: existingLoan.clientId,
              loanRecordId: loanId,
            },
          })
        )
      );
    }

    // Update references if provided
    if (body.references && body.references.length > 0) {
      // Delete existing references
      await prisma.reference.deleteMany({
        where: { loanRecordId: loanId },
      });

      // Create new references
      await Promise.all(
        body.references.map((reference: any) =>
          prisma.reference.create({
            data: {
              name: reference.name,
              phoneNumber: reference.phoneNumber,
              relationship: reference.relationship,
              clientId: existingLoan.clientId,
              loanRecordId: loanId,
            },
          })
        )
      );
    }

    // Update media files if provided
    if (body.mediaFiles && body.mediaFiles.length > 0) {
      // We don't delete existing media files to preserve history
      await Promise.all(
        body.mediaFiles
          .filter((file: any) => !file.id) // Only add new files
          .map((file: any) =>
            prisma.mediaFile.create({
              data: {
                fileName: file.fileName,
                fileType: file.fileType,
                fileUrl: file.fileUrl,
                description: file.description || null,
                clientId: existingLoan.clientId,
                loanRecordId: loanId,
              },
            })
          )
      );
    }

    return NextResponse.json({
      message: 'Loan record updated successfully',
      loanId: updatedLoan.id,
    });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan record' },
      { status: 500 }
    );
  }
}

// DELETE a specific loan by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id;

    // Check if loan exists
    const existingLoan = await prisma.loanRecord.findUnique({
      where: { id: loanId },
    });

    if (!existingLoan) {
      return NextResponse.json(
        { error: 'Loan record not found' },
        { status: 404 }
      );
    }

    // Delete related records first
    await prisma.guarantor.deleteMany({
      where: { loanRecordId: loanId },
    });

    await prisma.reference.deleteMany({
      where: { loanRecordId: loanId },
    });

    await prisma.mediaFile.deleteMany({
      where: { loanRecordId: loanId },
    });

    // Delete the loan record
    await prisma.loanRecord.delete({
      where: { id: loanId },
    });

    return NextResponse.json({
      message: 'Loan record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan record' },
      { status: 500 }
    );
  }
}
