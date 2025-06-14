import nodemailer from 'nodemailer';
import Appointment from '../models/Appointment.js';

const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS 

    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text
  });
};

const notificationMailCron = async () => {
  const twentyMinutesFromNow = new Date(Date.now() + 20 * 60 * 1000);
  const dateString = twentyMinutesFromNow.toISOString().split('T')[0];
  const timeString = twentyMinutesFromNow.toTimeString().split(' ')[0].slice(0, 5);

  const appointments = await Appointment.find({
    status: 'Scheduled',
    date: dateString,
    timeSlot: { $lte: timeString }
  }).populate('patientId', 'email');

  appointments.forEach(appointment => {
    const { patientId: { email }, timeSlot, date } = appointment;
    const timeLeft = Math.ceil((new Date(`${date}T${timeSlot}`) - Date.now()) / 60000);
    if (timeLeft === 10) {
      sendMail(email, 'Your appointment is about to start', `Your appointment is scheduled to start in 10 minutes. Please be ready.`).catch(console.error);
    } else if (timeLeft === 2) {
      sendMail(email, 'Your appointment is about to start', `Your appointment is scheduled to start in 2 minutes. Please be ready.`).catch(console.error);
    }
  });
};

export default notificationMailCron;