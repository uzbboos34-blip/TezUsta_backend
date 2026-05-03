import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const payments = await (prisma as any).paymentRequest.findMany({
    include: { user: true },
  });
  console.log(JSON.stringify(payments, (key, value) => 
    key === 'checkImg' ? (value ? value.substring(0, 50) + '...' : null) : value, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
