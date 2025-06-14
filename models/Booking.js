import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  name: String,
  date: String,
  service: String
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
