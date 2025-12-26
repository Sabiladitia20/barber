import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const appointmentSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
});

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { barberId, serviceId, startTime } = appointmentSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const start = new Date(startTime);
    
    // Get service duration
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const end = new Date(start.getTime() + service.duration * 60000);

    // Check for overlaps for this barber
    const overlap = await prisma.appointment.findFirst({
      where: {
        barberId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    });

    if (overlap) {
      return res.status(400).json({ error: 'Barber is already booked at this time' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        barberId,
        serviceId,
        startTime: start,
        endTime: end,
      },
      include: {
        barber: true,
        service: true,
      },
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        barber: true,
        service: true,
      },
      orderBy: { startTime: 'desc' },
    });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
