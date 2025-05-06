/**
 * Mock database for Njuwa Capital
 * 
 * This file provides mock data and functions to simulate database operations
 * when the actual MongoDB connection is unavailable.
 */

import { LoanStatus, FileType } from '@prisma/client';

// Mock client data
export const mockClients = [
  {
    id: 'mock_client_1',
    name: 'John Doe',
    idNumber: 'ID123456',
    phoneNumber1: '+1234567890',
    phoneNumber2: null,
    businessLocation: 'Downtown Market',
    permitNumber: 'P-12345',
    homeAddress: '123 Main St',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'mock_client_2',
    name: 'Jane Smith',
    idNumber: 'ID789012',
    phoneNumber1: '+0987654321',
    phoneNumber2: '+1122334455',
    businessLocation: 'Central Plaza',
    permitNumber: 'P-67890',
    homeAddress: '456 Oak Ave',
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-02-20'),
  },
];

// Mock loan records
export const mockLoanRecords = [
  {
    id: 'mock_loan_1',
    clientId: 'mock_client_1',
    loanAmount: 5000,
    interestRate: 10,
    registrationFee: 100,
    loanDuration: 30,
    applicationDate: new Date('2025-01-20'),
    disbursementDate: new Date('2025-01-25'),
    firstInstallmentDate: new Date('2025-02-01'),
    lastInstallmentDate: new Date('2025-02-25'),
    dailyPaymentCheck: true,
    loanOfficer: 'Michael Johnson',
    status: 'ACTIVE' as LoanStatus,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'mock_loan_2',
    clientId: 'mock_client_2',
    loanAmount: 10000,
    interestRate: 12,
    registrationFee: 200,
    loanDuration: 60,
    applicationDate: new Date('2025-02-25'),
    disbursementDate: new Date('2025-03-01'),
    firstInstallmentDate: new Date('2025-03-10'),
    lastInstallmentDate: new Date('2025-05-10'),
    dailyPaymentCheck: false,
    loanOfficer: 'Sarah Williams',
    status: 'DISBURSED' as LoanStatus,
    createdAt: new Date('2025-02-25'),
    updatedAt: new Date('2025-03-01'),
  },
  {
    id: 'mock_loan_3',
    clientId: 'mock_client_1',
    loanAmount: 3000,
    interestRate: 8,
    registrationFee: 50,
    loanDuration: 15,
    applicationDate: new Date('2025-04-05'),
    disbursementDate: null,
    firstInstallmentDate: null,
    lastInstallmentDate: null,
    dailyPaymentCheck: true,
    loanOfficer: 'Michael Johnson',
    status: 'PENDING' as LoanStatus,
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2025-04-05'),
  },
];

// Mock guarantors
export const mockGuarantors = [
  {
    id: 'mock_guarantor_1',
    name: 'Robert Brown',
    idNumber: 'ID-G12345',
    phoneNumber: '+2233445566',
    clientId: 'mock_client_1',
    loanRecordId: 'mock_loan_1',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
  {
    id: 'mock_guarantor_2',
    name: 'Emily Davis',
    idNumber: 'ID-G67890',
    phoneNumber: '+3344556677',
    clientId: 'mock_client_2',
    loanRecordId: 'mock_loan_2',
    createdAt: new Date('2025-02-25'),
    updatedAt: new Date('2025-02-25'),
  },
];

// Mock references
export const mockReferences = [
  {
    id: 'mock_reference_1',
    name: 'Thomas Wilson',
    phoneNumber: '+4455667788',
    relationship: 'Friend',
    clientId: 'mock_client_1',
    loanRecordId: 'mock_loan_1',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
  {
    id: 'mock_reference_2',
    name: 'Patricia Moore',
    phoneNumber: '+5566778899',
    relationship: 'Colleague',
    clientId: 'mock_client_1',
    loanRecordId: 'mock_loan_1',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
];

// Mock media files
export const mockMediaFiles = [
  {
    id: 'mock_media_1',
    fileName: 'contract_loan1.pdf',
    fileType: 'CONTRACT_PDF' as FileType,
    fileUrl: 'https://example.com/contracts/contract_loan1.pdf',
    description: 'Signed Contract',
    clientId: 'mock_client_1',
    loanRecordId: 'mock_loan_1',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
  },
];

// Dashboard statistics
export const mockDashboardStats = {
  totalLoans: 2,
  activeLoans: 1,
  loansEndingSoon: 1,
  totalDisbursed: 15000,
  totalInterestEarned: 1500,
  totalActiveInterest: 1000,
  totalExpectedReturn: 16500, // Principal + Interest
  totalActiveExpectedReturn: 11000, // Active loans principal + interest
  loanStatusDistribution: {
    PENDING: 1,
    APPROVED: 0,
    DISBURSED: 1,
    ACTIVE: 1,
    COMPLETED: 0,
    DEFAULTED: 0,
    REJECTED: 0,
  }
};

// Dashboard charts data
export const mockChartData = {
  monthlyLoans: [
    { month: 'Jan', count: 1, amount: 5000 },
    { month: 'Feb', count: 1, amount: 10000 },
    { month: 'Mar', count: 0, amount: 0 },
    { month: 'Apr', count: 1, amount: 3000 },
    { month: 'May', count: 0, amount: 0 },
  ],
  loansByStatus: [
    { status: 'PENDING', count: 1 },
    { status: 'DISBURSED', count: 1 },
    { status: 'ACTIVE', count: 1 },
  ],
  loansByAmount: [
    { range: '0-5000', count: 2 },
    { range: '5001-10000', count: 1 },
    { range: '10001+', count: 0 },
  ]
};

// Recent loans for dashboard
export const mockRecentLoans = mockLoanRecords.map(loan => {
  const client = mockClients.find(c => c.id === loan.clientId);
  return {
    ...loan,
    client: client || mockClients[0],
  };
});
