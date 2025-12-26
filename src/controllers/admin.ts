import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Get working hours for a barber
export const getWorkingHours = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const workingHours = await prisma.workingHours.findMany({
      where: { barberId },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(workingHours);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch working hours' });
  }
};

// Set working hours for a barber (Admin only)
export const setWorkingHours = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const { dayOfWeek, startTime, endTime, isActive } = req.body;

    const workingHour = await prisma.workingHours.upsert({
      where: {
        barberId_dayOfWeek: { barberId, dayOfWeek },
      },
      update: { startTime, endTime, isActive },
      create: { barberId, dayOfWeek, startTime, endTime, isActive },
    });

    res.json(workingHour);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set working hours' });
  }
};

// Set bulk working hours for a barber (Admin only)
export const setBulkWorkingHours = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const { schedule } = req.body; // Array of { dayOfWeek, startTime, endTime, isActive }

    const results = await Promise.all(
      schedule.map((item: any) =>
        prisma.workingHours.upsert({
          where: {
            barberId_dayOfWeek: { barberId, dayOfWeek: item.dayOfWeek },
          },
          update: { startTime: item.startTime, endTime: item.endTime, isActive: item.isActive },
          create: { barberId, ...item },
        })
      )
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set working hours' });
  }
};

// Get blocked dates for a barber
export const getBlockedDates = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const blockedDates = await prisma.blockedDate.findMany({
      where: { barberId },
      orderBy: { date: 'asc' },
    });
    res.json(blockedDates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked dates' });
  }
};

// Block a date for a barber (Admin only)
export const blockDate = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const { date, reason } = req.body;

    const blockedDate = await prisma.blockedDate.create({
      data: {
        barberId,
        date: new Date(date),
        reason,
      },
    });

    res.json(blockedDate);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Date is already blocked' });
    }
    res.status(500).json({ error: 'Failed to block date' });
  }
};

// Unblock a date (Admin only)
export const unblockDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blockedDate.delete({ where: { id } });
    res.json({ message: 'Date unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock date' });
  }
};

// Get all barbers with their working hours (for admin dashboard)
export const getAllBarbersWithSchedule = async (req: Request, res: Response) => {
  try {
    const barbers = await prisma.barber.findMany({
      include: {
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        blockedDates: { orderBy: { date: 'asc' } },
      },
    });
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barbers' });
  }
};

// Update appointment status (Admin only)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { barber: true, service: true, user: true },
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
};

// Get all appointments (Admin only)
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { date, barberId, status } = req.query;
    
    const where: any = {};
    
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }
    
    if (barberId) where.barberId = barberId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { barber: true, service: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { startTime: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};
