import Appointment from '../models/Appointment.js';

const cancelUnpaidAppointments = async () => {
  try {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

    const updatedAppointments = await Appointment.updateMany(
      {
        paymentStatus: 'pending',
        createdAt: { $lte: twentyMinutesAgo },
        status: { $ne: 'Cancelled' },
      },
      {
        status: 'Cancelled',
        paymentStatus: "failed",
        cancledNote: 'Cancelled due to non-payment within 20 minutes'
      }
    );

    console.log(`Cancelled ${updatedAppointments.nModified} unpaid appointments.`);
  } catch (err) {
    console.error('Error cancelling unpaid appointments:', err);
  }
};
export default cancelUnpaidAppointments

