import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { getBarbers, createBarber, updateBarber, deleteBarber } from './controllers/barber.js';
import { getServices, createService, updateService, deleteService } from './controllers/service.js';
import { createAppointment, getMyAppointments } from './controllers/appointment.js';
import { authenticate, authorizeAdmin } from './middleware/auth.js';
import {
  getWorkingHours,
  setWorkingHours,
  setBulkWorkingHours,
  getBlockedDates,
  blockDate,
  unblockDate,
  getAllBarbersWithSchedule,
  updateAppointmentStatus,
  getAllAppointments,
} from './controllers/admin.js';
import {
  getAvailableSlots,
  createAppointmentWithSlot,
  getScheduleView,
  cancelAppointment,
} from './controllers/slot.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// PUBLIC ROUTES
// =====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

// Barber routes (public GET)
app.get('/barbers', getBarbers);

// Service routes (public GET)
app.get('/services', getServices);

// =====================
// SLOT ROUTES (Public - for viewing available slots)
// =====================
app.get('/slots/available', getAvailableSlots);
app.get('/slots/schedule', getScheduleView);

// =====================
// USER ROUTES (Authenticated)
// =====================
app.get('/appointments/my', authenticate, getMyAppointments);
app.post('/appointments', authenticate, createAppointmentWithSlot);
app.patch('/appointments/:id/cancel', authenticate, cancelAppointment);

// =====================
// ADMIN ROUTES
// =====================
// Working Hours
app.get('/admin/barbers/:barberId/working-hours', authenticate, authorizeAdmin, getWorkingHours);
app.post('/admin/barbers/:barberId/working-hours', authenticate, authorizeAdmin, setWorkingHours);
app.put('/admin/barbers/:barberId/working-hours/bulk', authenticate, authorizeAdmin, setBulkWorkingHours);

// Blocked Dates
app.get('/admin/barbers/:barberId/blocked-dates', authenticate, authorizeAdmin, getBlockedDates);
app.post('/admin/barbers/:barberId/blocked-dates', authenticate, authorizeAdmin, blockDate);
app.delete('/admin/blocked-dates/:id', authenticate, authorizeAdmin, unblockDate);

// Barber Management (Admin)
app.get('/admin/barbers', authenticate, authorizeAdmin, getAllBarbersWithSchedule);
app.post('/admin/barbers', authenticate, authorizeAdmin, createBarber);
app.put('/admin/barbers/:id', authenticate, authorizeAdmin, updateBarber);
app.delete('/admin/barbers/:id', authenticate, authorizeAdmin, deleteBarber);

// Service Management (Admin)
app.post('/admin/services', authenticate, authorizeAdmin, createService);
app.put('/admin/services/:id', authenticate, authorizeAdmin, updateService);
app.delete('/admin/services/:id', authenticate, authorizeAdmin, deleteService);

// Appointment Management (Admin)
app.get('/admin/appointments', authenticate, authorizeAdmin, getAllAppointments);
app.patch('/admin/appointments/:id/status', authenticate, authorizeAdmin, updateAppointmentStatus);

export default app;
