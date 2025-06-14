import express from 'express';
import {
  bookAppointment,
  getAppointmentById,
  getDoctorAvailableDaysForMonth,
  getAvailableSlotsByDate
} from '../controller/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/book', protect, bookAppointment);
router.get('/:id', protect, getAppointmentById);
router.get('/doctor/:doctorId/available-days', getDoctorAvailableDaysForMonth);
router.get('/doctor/:doctorId/available-slots', getAvailableSlotsByDate);

export default router;
