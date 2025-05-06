import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idNumber = searchParams.get('idNumber');

    if (!idNumber) {
      return NextResponse.json(
        { error: 'ID Number is required for search' },
        { status: 400 }
      );
    }

    // Find client by ID number
    const client = await prisma.client.findUnique({
      where: { idNumber },
      include: {
        loanRecords: {
          include: {
            guarantors: true,
            references: true,
            mediaFiles: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'No client found with the provided ID number' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error searching loans:', error);
    return NextResponse.json(
      { error: 'Failed to search loan records' },
      { status: 500 }
    );
  }
}
