// Initialize MongoDB database with sample data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  try {
    // Create a sample client
    console.log('Creating sample client...');
    const client = await prisma.client.create({
      data: {
        name: 'John Doe',
        idNumber: 'ID123456',
        phoneNumber1: '+1234567890',
        phoneNumber2: null,
        businessLocation: 'Downtown Market',
        permitNumber: 'P-12345',
        homeAddress: '123 Main St',
      },
    });
    console.log(`Created client with ID: ${client.id}`);

    // Create a sample loan record
    console.log('Creating sample loan record...');
    const loanRecord = await prisma.loanRecord.create({
      data: {
        clientId: client.id,
        loanAmount: 5000,
        interestRate: 10,
        registrationFee: 100,
        loanDuration: 30,
        applicationDate: new Date(),
        disbursementDate: new Date(),
        firstInstallmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        lastInstallmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        dailyPaymentCheck: true,
        loanOfficer: 'Michael Johnson',
        status: 'ACTIVE',
      },
    });
    console.log(`Created loan record with ID: ${loanRecord.id}`);

    // Create a guarantor
    console.log('Creating sample guarantor...');
    const guarantor = await prisma.guarantor.create({
      data: {
        name: 'Robert Brown',
        idNumber: 'ID-G12345',
        phoneNumber: '+2233445566',
        clientId: client.id,
        loanRecordId: loanRecord.id,
      },
    });
    console.log(`Created guarantor with ID: ${guarantor.id}`);

    // Create references
    console.log('Creating sample references...');
    const reference1 = await prisma.reference.create({
      data: {
        name: 'Thomas Wilson',
        phoneNumber: '+4455667788',
        relationship: 'Friend',
        clientId: client.id,
        loanRecordId: loanRecord.id,
      },
    });
    console.log(`Created reference with ID: ${reference1.id}`);

    const reference2 = await prisma.reference.create({
      data: {
        name: 'Patricia Moore',
        phoneNumber: '+5566778899',
        relationship: 'Colleague',
        clientId: client.id,
        loanRecordId: loanRecord.id,
      },
    });
    console.log(`Created reference with ID: ${reference2.id}`);

    // Create a media file record
    console.log('Creating sample media file record...');
    const mediaFile = await prisma.mediaFile.create({
      data: {
        fileName: 'sample_contract.pdf',
        fileType: 'CONTRACT_PDF',
        fileUrl: 'https://example.com/contracts/sample_contract.pdf',
        description: 'Sample Contract',
        clientId: client.id,
        loanRecordId: loanRecord.id,
      },
    });
    console.log(`Created media file with ID: ${mediaFile.id}`);

    console.log('Database initialization completed successfully!');
    console.log('Summary:');
    console.log(`- Created 1 client: ${client.name}`);
    console.log(`- Created 1 loan record: $${loanRecord.loanAmount} at ${loanRecord.interestRate}% interest`);
    console.log(`- Created 1 guarantor: ${guarantor.name}`);
    console.log(`- Created 2 references`);
    console.log(`- Created 1 media file record`);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Database initialization script completed.'))
  .catch((error) => {
    console.error('Fatal error during database initialization:', error);
    process.exit(1);
  });
