import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

const SLOT_DURATION = 30; // 30 menit per slot

// Helper: Parse time string to minutes
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Format minutes to time string
function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Get available slots for a barber on a specific date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
      return res.status(400).json({ error: 'barberId and date are required' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay(); // 0-6

    // Check if barber exists
    const barber = await prisma.barber.findUnique({ where: { id: barberId as string } });
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    // Check if date is blocked
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        barberId: barberId as string,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (blockedDate) {
      return res.json({ 
        available: false, 
        reason: blockedDate.reason || 'Barber is not available on this date',
        slots: [] 
      });
    }

    // Get working hours for this day
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        barberId: barberId as string,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!workingHours) {
      return res.json({ 
        available: false, 
        reason: 'Barber does not work on this day',
        slots: [] 
      });
    }

    // Get existing appointments for this day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId: barberId as string,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      select: { startTime: true, endTime: true },
    });

    // Generate all possible slots
    const startMinutes = parseTimeToMinutes(workingHours.startTime);
    const endMinutes = parseTimeToMinutes(workingHours.endTime);
    const slots: { time: string; available: boolean }[] = [];

    for (let time = startMinutes; time + SLOT_DURATION <= endMinutes; time += SLOT_DURATION) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION);

      // Check if slot is in the past
      const now = new Date();
      if (slotStart < now) {
        continue; // Skip past slots
      }

      // Check if slot conflicts with existing appointments
      const isConflicting = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: formatMinutesToTime(time),
        available: !isConflicting,
      });
    }

    res.json({
      available: true,
      workingHours: {
        start: workingHours.startTime,
        end: workingHours.endTime,
      },
      slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

export const createAppointmentWithSlot = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { barberId, serviceId, date, time } = req.body;

    if (!barberId || !serviceId || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get service duration
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate start and end time
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    // Check if start time is in the past
    if (startTime < new Date()) {
      return res.status(400).json({ error: 'Cannot book a slot in the past' });
    }

    // Check if date is blocked
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (blockedDate) {
      return res.status(400).json({ error: 'Barber is not available on this date' });
    }

    // Check working hours
    const dayOfWeek = startTime.getDay();
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        barberId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!workingHours) {
      return res.status(400).json({ error: 'Barber does not work on this day' });
    }

    const requestedTimeMinutes = hours * 60 + minutes;
    const workStartMinutes = parseTimeToMinutes(workingHours.startTime);
    const workEndMinutes = parseTimeToMinutes(workingHours.endTime);

    if (requestedTimeMinutes < workStartMinutes || (requestedTimeMinutes + service.duration) > workEndMinutes) {
      return res.status(400).json({ error: 'Requested time is outside working hours' });
    }

    // Check for conflicts with existing appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        barberId,
        serviceId,
        startTime,
        endTime,
        status: 'PENDING',
      },
      include: { barber: true, service: true },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Get schedule view (all slots for a date with availability)
export const getScheduleView = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all barbers with their working hours for this day
    const barbers = await prisma.barber.findMany({
      include: {
        workingHours: {
          where: { dayOfWeek, isActive: true },
        },
        blockedDates: {
          where: {
            date: { gte: startOfDay, lte: endOfDay },
          },
        },
      },
    });

    // Get all appointments for this day
    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      include: { user: { select: { name: true } }, service: true },
    });

    // Build schedule for each barber
    const schedule = barbers.map((barber) => {
      const isBlocked = barber.blockedDates.length > 0;
      const workingHour = barber.workingHours[0];

      if (isBlocked || !workingHour) {
        return {
          barber: { id: barber.id, name: barber.name, specialty: barber.specialty },
          available: false,
          reason: isBlocked ? 'Holiday/Blocked' : 'Not working',
          slots: [],
        };
      }

      const startMinutes = parseTimeToMinutes(workingHour.startTime);
      const endMinutes = parseTimeToMinutes(workingHour.endTime);
      const barberAppointments = appointments.filter((a) => a.barberId === barber.id);

      const slots = [];
      for (let time = startMinutes; time + SLOT_DURATION <= endMinutes; time += SLOT_DURATION) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION);

        const appointment = barberAppointments.find((apt) => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          return slotStart < aptEnd && slotEnd > aptStart;
        });

        slots.push({
          time: formatMinutesToTime(time),
          available: !appointment && slotStart > new Date(),
          appointment: appointment
            ? {
                id: appointment.id,
                customer: appointment.user.name,
                service: appointment.service.name,
                status: appointment.status,
              }
            : null,
        });
      }

      return {
        barber: { id: barber.id, name: barber.name, specialty: barber.specialty },
        available: true,
        workingHours: {
          start: workingHour.startTime,
          end: workingHour.endTime,
        },
        slots,
      };
    });

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Cancel appointment (by user)
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { barber: true, service: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};
