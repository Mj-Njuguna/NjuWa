import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parse, format } from 'date-fns';
import { createObjectCsvStringifier } from 'csv-writer';
// @ts-ignore
import PDFDocument from 'pdfkit';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'loans';
    const exportFormat = searchParams.get('format') || 'csv';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Parse dates
    const from = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = toDate ? new Date(toDate) : new Date();

    // Set end of day for the to date
    to.setHours(23, 59, 59, 999);

    // Get data based on report type
    let data;
    switch (reportType) {
      case 'loans':
        data = await getLoanRecords(from, to);
        break;
      case 'payments':
        data = await getPaymentHistory(from, to);
        break;
      case 'clients':
        data = await getClientList(from, to);
        break;
      case 'summary':
        data = await getSummaryReport(from, to);
        break;
      default:
        data = await getLoanRecords(from, to);
    }

    // Generate report based on format
    let result;
    let contentType;
    let filename;

    if (exportFormat === 'csv') {
      result = generateCsvReport(data, reportType);
      contentType = 'text/csv';
      filename = `${reportType}_report_${format(from, 'yyyy-MM-dd')}_to_${format(to, 'yyyy-MM-dd')}.csv`;
    } else {
      result = await generatePdfReport(data, reportType, from, to);
      contentType = 'application/pdf';
      filename = `${reportType}_report_${format(from, 'yyyy-MM-dd')}_to_${format(to, 'yyyy-MM-dd')}.pdf`;
    }

    // Return the report
    return new NextResponse(result, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Get loan records
async function getLoanRecords(from: Date, to: Date) {
  const loans = await prisma.loanRecord.findMany({
    where: {
      applicationDate: {
        gte: from,
        lte: to,
      },
    },
    include: {
      client: true,
    },
    orderBy: {
      applicationDate: 'desc',
    },
  });

  return loans.map(loan => ({
    ID: loan.id,
    ClientName: loan.client.name,
    ClientID: loan.client.idNumber,
    PhoneNumber: loan.client.phoneNumber1,
    LoanAmount: loan.loanAmount,
    InterestRate: loan.interestRate,
    TotalAmount: loan.loanAmount + (loan.loanAmount * loan.interestRate / 100),
    ApplicationDate: format(new Date(loan.applicationDate), 'yyyy-MM-dd'),
    DisbursementDate: loan.disbursementDate ? format(new Date(loan.disbursementDate), 'yyyy-MM-dd') : 'N/A',
    Status: loan.status,
    LoanOfficer: loan.loanOfficer,
  }));
}

// Get payment history
async function getPaymentHistory(from: Date, to: Date) {
  // This is a placeholder - in a real app, you would have a payments table
  // For now, we'll simulate payment data
  return [
    {
      ID: '1',
      ClientName: 'John Doe',
      LoanID: 'LOAN-001',
      PaymentDate: '2023-05-01',
      Amount: 5000,
      PaymentMethod: 'Cash',
      ReceivedBy: 'Jane Smith',
    },
    {
      ID: '2',
      ClientName: 'Alice Johnson',
      LoanID: 'LOAN-002',
      PaymentDate: '2023-05-02',
      Amount: 3000,
      PaymentMethod: 'M-Pesa',
      ReceivedBy: 'Jane Smith',
    },
  ];
}

// Get client list
async function getClientList(from: Date, to: Date) {
  const clients = await prisma.client.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      loanRecords: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return clients.map(client => {
    const totalLoans = client.loanRecords.length;
    const activeLoans = client.loanRecords.filter(loan => loan.status === 'ACTIVE').length;
    const totalAmount = client.loanRecords.reduce((sum, loan) => sum + loan.loanAmount, 0);
    
    return {
      ID: client.id,
      Name: client.name,
      IDNumber: client.idNumber,
      PhoneNumber: client.phoneNumber1,
      BusinessLocation: client.businessLocation,
      TotalLoans: totalLoans,
      ActiveLoans: activeLoans,
      TotalAmount: totalAmount,
    };
  });
}

// Get summary report
async function getSummaryReport(from: Date, to: Date) {
  const loans = await prisma.loanRecord.findMany({
    where: {
      applicationDate: {
        gte: from,
        lte: to,
      },
    },
  });

  const totalLoans = loans.length;
  const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
  const completedLoans = loans.filter(loan => loan.status === 'COMPLETED').length;
  const defaultedLoans = loans.filter(loan => loan.status === 'DEFAULTED').length;
  
  const totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  const totalInterest = loans.reduce((sum, loan) => sum + (loan.loanAmount * loan.interestRate / 100), 0);
  
  return [{
    TotalLoans: totalLoans,
    PendingLoans: pendingLoans,
    ActiveLoans: activeLoans,
    CompletedLoans: completedLoans,
    DefaultedLoans: defaultedLoans,
    TotalAmount: totalAmount,
    TotalInterest: totalInterest,
    Period: `${format(from, 'yyyy-MM-dd')} to ${format(to, 'yyyy-MM-dd')}`,
  }];
}

// Generate CSV report
function generateCsvReport(data: any[], reportType: string) {
  if (!data || data.length === 0) {
    return 'No data available for the selected period';
  }

  // Get headers from the first item
  const headers = Object.keys(data[0]).map(key => ({
    id: key,
    title: key
  }));

  // Create CSV stringifier
  const csvStringifier = createObjectCsvStringifier({
    header: headers
  });

  // Generate CSV
  const csvHeader = csvStringifier.getHeaderString();
  const csvRows = csvStringifier.stringifyRecords(data);
  
  return csvHeader + csvRows;
}

// Generate PDF report
async function generatePdfReport(data: any[], reportType: string, from: Date, to: Date) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Buffer to store PDF
      const chunks: any[] = [];
      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(chunks);
        resolve(pdfData);
      });

      // Add title
      doc.fontSize(20).text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, { align: 'center' });
      doc.moveDown();
      
      // Add date range
      doc.fontSize(12).text(`Period: ${format(from, 'MMMM d, yyyy')} to ${format(to, 'MMMM d, yyyy')}`, { align: 'center' });
      doc.moveDown(2);

      // If no data
      if (!data || data.length === 0) {
        doc.fontSize(12).text('No data available for the selected period', { align: 'center' });
        doc.end();
        return;
      }

      // Get headers
      const headers = Object.keys(data[0]);
      
      // Calculate column widths
      const tableWidth = 500;
      const columnWidth = tableWidth / headers.length;
      
      // Draw headers
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, 50 + (i * columnWidth), doc.y, {
          width: columnWidth,
          align: 'left',
        });
      });
      
      doc.moveDown();
      doc.font('Helvetica');

      // Draw rows
      data.forEach(row => {
        const y = doc.y;
        
        headers.forEach((header, i) => {
          let value = row[header]?.toString() || '';
          
          // Format currency values
          if (header.includes('Amount') || header.includes('Interest')) {
            if (typeof row[header] === 'number') {
              value = `KES ${row[header].toLocaleString()}`;
            }
          }
          
          doc.text(value, 50 + (i * columnWidth), y, {
            width: columnWidth,
            align: 'left',
          });
        });
        
        doc.moveDown();
        
        // Add a new page if we're near the bottom
        if (doc.y > 700) {
          doc.addPage();
        }
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
