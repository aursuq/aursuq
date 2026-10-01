import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.env.AURSUQ_INITIAL_OWNER_EMAIL;

  if (!rawEmail || rawEmail.trim() === '') {
    console.error('Error: AURSUQ_INITIAL_OWNER_EMAIL environment variable is not defined or empty.');
    process.exit(1);
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    console.log('Initial owner user already exists. Ensuring OWNER role and ACTIVE status.');
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('Initial owner updated successfully.');
  } else {
    console.log('Creating initial owner user.');
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName: 'Platform Owner',
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('Initial owner created successfully.');
  }

  const ownerCount = await prisma.user.count({
    where: { role: UserRole.OWNER },
  });
  console.log(`Total OWNER users in database: ${ownerCount}`);
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
