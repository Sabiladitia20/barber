import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const barberSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const getBarbers = async (req: Request, res: Response) => {
  try {
    const barbers = await prisma.barber.findMany();
    res.json(barbers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBarber = async (req: Request, res: Response) => {
  try {
    const data = barberSchema.parse(req.body);
    const barber = await prisma.barber.create({ data });

    // Create default working hours (Mon-Sun, 10:00 - 21:00)
    const workingHoursData = Array.from({ length: 7 }, (_, i) => ({
      barberId: barber.id,
      dayOfWeek: i,
      startTime: '10:00',
      endTime: '21:00',
      isActive: true,
    }));

    await prisma.workingHours.createMany({ data: workingHoursData });

    res.status(201).json(barber);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = barberSchema.partial().parse(req.body);
    const barber = await prisma.barber.update({ where: { id }, data });
    res.json(barber);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.barber.delete({ where: { id } });
    res.json({ message: 'Barber deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
