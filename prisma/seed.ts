import 'dotenv/config';
import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Services
  const haircut = await prisma.service.upsert({
    where: { id: 'service-1' },
    update: {},
    create: {
      id: 'service-1',
      name: 'Gentleman Haircut',
      price: 50000,
      duration: 30, // 30 menit = 1 slot
    },
  });

  const fullService = await prisma.service.upsert({
    where: { id: 'service-2' },
    update: {},
    create: {
      id: 'service-2',
      name: 'Full Service (Cut + Wash)',
      price: 85000,
      duration: 60, // 60 menit = 2 slot
    },
  });

  const shave = await prisma.service.upsert({
    where: { id: 'service-3' },
    update: {},
    create: {
      id: 'service-3',
      name: 'Beard Trim & Shave',
      price: 35000,
      duration: 30,
    },
  });

  const coloring = await prisma.service.upsert({
    where: { id: 'service-4' },
    update: {},
    create: {
      id: 'service-4',
      name: 'Hair Coloring',
      price: 150000,
      duration: 90, // 90 menit = 3 slot
    },
  });

  console.log('✅ Services created');

  // 2. Create Barbers
  const barber1 = await prisma.barber.upsert({
    where: { id: 'barber-1' },
    update: {},
    create: {
      id: 'barber-1',
      name: 'Budi Santoso',
      specialty: 'Classic Cut & Fade Specialist',
    },
  });

  const barber2 = await prisma.barber.upsert({
    where: { id: 'barber-2' },
    update: {},
    create: {
      id: 'barber-2',
      name: 'Andi Kurniawan',
      specialty: 'Modern Style & Hair Design',
    },
  });

  const barber3 = await prisma.barber.upsert({
    where: { id: 'barber-3' },
    update: {},
    create: {
      id: 'barber-3',
      name: 'Rudi Hermawan',
      specialty: 'Beard & Grooming Expert',
    },
  });

  console.log('✅ Barbers created');

  // 3. Set Working Hours for each barber
  const barbers = [barber1, barber2, barber3];
  
  for (const barber of barbers) {
    // Default working hours: Mon-Fri 09:00-21:00, Sat 10:00-18:00, Sun off
    const defaultSchedule = [
      { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Sunday - Off
      { dayOfWeek: 1, startTime: '09:00', endTime: '21:00', isActive: true },  // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '21:00', isActive: true },  // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '21:00', isActive: true },  // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '21:00', isActive: true },  // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '21:00', isActive: true },  // Friday
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isActive: true },  // Saturday
    ];

    for (const schedule of defaultSchedule) {
      await prisma.workingHours.upsert({
        where: {
          barberId_dayOfWeek: {
            barberId: barber.id,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        update: schedule,
        create: {
          barberId: barber.id,
          ...schedule,
        },
      });
    }
  }

  console.log('✅ Working hours set for all barbers');

  // 4. Create Admin user
  const bcrypt = await import('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@luxecuts.com' },
    update: {},
    create: {
      email: 'admin@luxecuts.com',
      password: adminPassword,
      name: 'Admin LuxeCuts',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created (admin@luxecuts.com / admin123)');

  // 5. Block some dates as example (holidays)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7); // Block a day next week as example

  // Only block for first barber as demo
  await prisma.blockedDate.upsert({
    where: {
      barberId_date: {
        barberId: barber1.id,
        date: tomorrow,
      },
    },
    update: {},
    create: {
      barberId: barber1.id,
      date: tomorrow,
      reason: 'Personal Leave',
    },
  });

  console.log('✅ Example blocked date created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   - 4 Services created');
  console.log('   - 3 Barbers created');
  console.log('   - Working hours set (Mon-Sat)');
  console.log('   - Admin account: admin@luxecuts.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
