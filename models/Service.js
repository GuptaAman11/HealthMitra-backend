import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: String,
  description: String
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
