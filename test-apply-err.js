async function test() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const newJob = await prisma.job.create({
      data: {
        title: "Test Job", cat: "santexnik", price: 15000, addr: "Tashkent", phone: "+998901234567",
        date: "Bugun", desc: "Test description", clientId: 3, status: 'open', requiredWorkers: 2
      }
    });

    const workerId = 2; // Assuming worker ID 2 exists
    const minBal = 30000;
    const id = newJob.id;

    await prisma.$transaction(async (tx) => {
        const currentJob = await tx.job.findFirst({
          where: { id, status: 'open', isDeleted: false },
          include: { applicants: true },
        });

        const applicantCount = currentJob.applicants.length;

        await tx.user.update({
          where: { id: workerId },
          data: { balance: { decrement: minBal } },
        });

        await tx.transaction.create({
          data: {
            userId: workerId,
            amount: minBal,
            type: 'commission',
            desc: `"${currentJob.title}" ishi uchun to'lov`,
          },
        });

        // Oh wait, `this.logs` is not available in Prisma transaction like this!
        // In my code I used `await this.logs.create(...)` inside the transaction!
    });
    
    console.log("Success");
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
