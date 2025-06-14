import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  scheduledAt: Date,
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  symptoms: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Appointment', AppointmentSchema);