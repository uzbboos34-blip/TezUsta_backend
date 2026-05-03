async function test() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Create a new job
    const client = await prisma.user.findFirst({ where: { role: 'client' } });
    const newJob = await prisma.job.create({
      data: {
        title: "Test Job",
        cat: "santexnik",
        price: 15000,
        addr: "Tashkent",
        phone: "+998901234567",
        date: "Bugun",
        desc: "Test description",
        clientId: client.id,
        status: 'open',
        requiredWorkers: 2
      }
    });

    // Find a valid worker
    const worker = await prisma.user.findFirst({ where: { role: 'worker', balance: { gte: 30000 } } });

    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: worker.phone, pass: '123456' })
    });
    const data = await res.json();
    const token = data.access_token;

    const res2 = await fetch(`http://localhost:3001/jobs/${newJob.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log("Apply Response:", data2);
    
    // Clean up
    await prisma.jobApplicant.deleteMany({ where: { jobId: newJob.id } });
    await prisma.job.delete({ where: { id: newJob.id } });
    await prisma.$disconnect();
  } catch(e) {
    console.error(e.message);
  }
}
test();
