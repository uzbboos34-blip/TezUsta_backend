const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating existing jobs location data...');
  
  const jobs = await prisma.job.findMany({
    include: { client: true }
  });

  for (const job of jobs) {
    if (!job.region && job.client) {
      console.log(`Updating job ${job.id} with client location: ${job.client.region}, ${job.client.district}`);
      await prisma.job.update({
        where: { id: job.id },
        data: {
          region: job.client.region,
          dist: job.client.district
        }
      });
    }
  }

  console.log('Migration done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
