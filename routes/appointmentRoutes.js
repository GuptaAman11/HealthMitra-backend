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
import Appointment from '../models/Appointment.js';

const router = express.Router();
router.post('/attendedappointment', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.body.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    // Only the assigned doctor can mark the appointment as completed
    if (appointment.doctorId.toString() !== req.user.userDetails._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the assigned doctor can complete this appointment' });
    }
    
    appointment.status = 'Completed';
    await appointment.save();

    res.status(200).json({ message: 'Appointment marked as completed', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status', error: error.message });
  }
});
router.get('/completed-appointment', protect, async (req, res) => {
  try {
    const userId = req.user.userDetails._id;
    const completedAppointments = await Appointment.find({
      $or: [{ patientId: userId }, { doctorId: userId }],
      status: 'Completed'
    }).populate('doctorId', 'name specialization').populate('patientId', 'name');

    res.status(200).json(completedAppointments);
  } catch (error) {
    console.error('Error fetching completed appointments:', error);
    res.status(500).json({ message: 'Failed to fetch completed appointments', error: error.message });
  }
}
);
// router.post('/book', protect, bookAppointment);
router.post('/book/confirm-payment', protect, confirmPayment);
router.get('/me', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
// router.get('/doctor/:doctorId/available-days', getDoctorAvailableDaysForMonth);
// router.get('/doctor/:doctorId/available-slots', getAvailableSlotsByDate);
router.post('/book/start/:id', protect, startAppointment);
router.post('/book/end/:id', protect, endAppointment);

router.post('/get-booked-slots', protect, async (req, res) => {
  const { doctorId, date } = req.body;

  if (!doctorId || !date) {
    return res.status(400).json({ message: 'doctorId and date are required' });
  }

  try {
    const bookedSlots = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'Cancelled' } // Exclude cancelled
    }).distinct('timeSlot');

    res.status(200).json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked slots', error: error.message });
  }
});


router.post('/book', protect, async (req, res) => {
  const { doctorId, date, timeSlot, serviceType } = req.body;
  const patientId = req.user.userDetails._id;
  function generateRoomId(doctorId, patientId, date) {
    const cleanTime = new Date(date).getTime(); // epoch milliseconds
    const randomSegment = Math.random().toString(36).substring(2, 8); // 6-char random string
    return `room-${doctorId.slice(-4)}-${patientId.slice(-4)}-${cleanTime}-${randomSegment}`;
  }
  
  // Validate input
  if (!doctorId || !date || !timeSlot || !serviceType) {
    return res.status(400).json({ message: 'doctorId, date, timeSlot, and serviceType are required' });
  }

  try {
    // Check if timeSlot already booked
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
    if (existing) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    
    const appointment = new Appointment({
      doctorId,
      patientId, // from protect middleware
      date,
      timeSlot,
      serviceType,
      status: 'Scheduled',
      paymentStatus: 'paid',
      roomId: generateRoomId(doctorId, patientId, date)
    });

    await appointment.save();
    return res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Failed to book appointment', error: error.message });
  }
});




export default router;
