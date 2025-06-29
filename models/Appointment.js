import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  scheduledAt: Date,
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Started'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now },
  roomId: {
    type: String,
    required: false, // or true if going forward it's always needed
    unique: true // optional if you want roomIds to be unique
  },
    paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }, 
  timeSlot: String,
  date: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  note: String,
  cancledNote: String
});

export default mongoose.model('Appointment', AppointmentSchema);

