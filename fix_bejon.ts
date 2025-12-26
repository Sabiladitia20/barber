
import { PrismaClient } from './src/generated/client/index.js';

const prisma = new PrismaClient();

async function fixBejon() {
  const bejon = await prisma.barber.findFirst({
    where: { name: { contains: 'Bejon', mode: 'insensitive' } }
  });

  if (!bejon) {
    console.log('Barber Bejon not found');
    return;
  }

  console.log(`Found Bejon: ${bejon.id}`);

  // Check existing working hours
  const existing = await prisma.workingHours.findMany({
    where: { barberId: bejon.id }
  });

  if (existing.length > 0) {
    console.log('Bejon already has working hours.');
    return;
  }

  console.log('Adding working hours for Bejon...');
  const workingHoursData = Array.from({ length: 7 }, (_, i) => ({
    barberId: bejon.id,
    dayOfWeek: i,
    startTime: '10:00',
    endTime: '21:00',
    isActive: true,
  }));

  await prisma.workingHours.createMany({ data: workingHoursData });
  console.log('Success!');
}

fixBejon()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
