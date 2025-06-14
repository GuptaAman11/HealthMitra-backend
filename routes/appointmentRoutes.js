import express from 'express';
import {
  bookAppointment,
  getAppointmentById,
  getDoctorAvailableDaysForMonth,
  getAvailableSlotsByDate,
  confirmPayment,
  getMyAppointments,
  startAppointment,
  endAppointment
} from '../controller/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/book', protect, bookAppointment);
router.post('/book/confirm-payment', protect, confirmPayment);
router.get('/me', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.get('/doctor/:doctorId/available-days', getDoctorAvailableDaysForMonth);
router.get('/doctor/:doctorId/available-slots', getAvailableSlotsByDate);
router.post('/book/start/:id', protect, startAppointment);
router.post('/book/end/:id', protect, endAppointment);


export default router;
