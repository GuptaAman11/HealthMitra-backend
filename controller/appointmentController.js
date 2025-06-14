import Razorpay from 'razorpay';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import dotenv from 'dotenv';
import crypto from 'crypto'

dotenv.config();


// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot,note } = req.body;
  const patientId = req.user.userDetails._id;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const currentDate = new Date();
    const givenDate = new Date(`${date}T${timeSlot}`);
    if (givenDate < currentDate) {
      return res.status(400).json({ message: "Cannot book appointment for past date" });
    }

    const weekday = givenDate.toLocaleString('en-US', { weekday: 'long' });

    const availableDay = doctor.availability.find(a => a.day === weekday);
    if (!availableDay || !availableDay.slots.includes(timeSlot)) {
      return res.status(400).json({ message: "Doctor is not available at this time" });
    }

    const alreadyBooked = await Appointment.find({ doctorId, date, timeSlot , status: 'Scheduled'});
    if (alreadyBooked.length) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // Calculate fee (you can dynamically set this per doctor later)
    const amount = 50000; // ₹500 in paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        doctorId,
        patientId,
        date,
        timeSlot
      }
    });

    // Temporarily create appointment (status = pending)
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      note
    });
    await appointment.save();

    res.status(201).json({
      message: 'Razorpay order created. Proceed with payment.',
      appointmentId: appointment._id,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err.message });
  }
};


export const confirmPayment = async (req, res) => {
  const { appointmentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  // Update appointment
  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus: 'paid',
    razorpayPaymentId: razorpay_payment_id
  });

  res.status(200).json({ message: 'Payment verified and appointment confirmed' });
};



/**
 * GET AVAILABLE DATES FOR A DOCTOR IN A GIVEN MONTH
 */
export const getDoctorAvailableDaysForMonth = async (req, res) => {
  const { doctorId } = req.params;
  const { month } = req.query; // format: YYYY-MM

  try {
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor || !doctor.availability) {
      return res.status(404).json({ message: 'Doctor not found or no availability' });
    }

    const [year, monthIndex] = month.split('-').map(Number); // e.g. [2025, 6]
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    const currentDate = new Date();
    const availableDates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, monthIndex - 1, day); 
      if (dateObj < new Date(currentDate.getTime() - 1000 * 60 * 60 * 24)) continue;

      const weekday = dateObj.toLocaleString('en-US', { weekday: 'long' });
      const dateStr = dateObj.toLocaleDateString('en-CA');

      const availability = doctor.availability.find(a => a.day === weekday);
      if (!availability) continue;

      const bookedSlots = await Appointment
        .find({ doctorId, date: dateStr , status: { $ne: "Cancelled" } })
        .distinct("timeSlot");

      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const freeSlots = availability.slots.filter(slot => {
        if (dateObj.toDateString() === currentDate.toDateString()) {
          return !bookedSlots.includes(slot) && slot >= currentTime;
        }
        return !bookedSlots.includes(slot);
      });
      if (freeSlots.length > 0) {
        availableDates.push(dateStr);
      }
    }

    res.json({ availableDates });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving available days', error: err.message });
  }
};

/**
 * GET AVAILABLE SLOTS FOR A DOCTOR ON A SPECIFIC DATE
 */
export const getAvailableSlotsByDate = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query; // format: YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ message: "Date is required in query (YYYY-MM-DD)" });
  }

  try {
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor || !doctor.availability) {
      return res.status(404).json({ message: 'Doctor not found or no availability' });
    }

    const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
    const availability = doctor.availability.find(a => a.day === weekday);
    if (!availability) {
      return res.status(200).json({ availableSlots: [] }); // Not working that day
    }

    const bookedSlots = await Appointment
      .find({ doctorId, date, status: { $ne: "Cancelled" } })
      .distinct("timeSlot");

    const currentTime = new Date().toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const availableSlots = availability.slots.filter(slot => !bookedSlots.includes(slot) && slot >= currentTime);

    res.json({ date, weekday, availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching available slots', error: err.message });
  }
};

/**
 * GET APPOINTMENT BY ID
 */
export const getAppointmentById = async (req, res) => {
    const userID = req.user.userDetials._id;
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name specialization')  
      .populate('patientId', 'name phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if(appointment.patientId._id !== userID && appointment.doctorId._id !== userID){
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointment', error: err.message });
  }
};
