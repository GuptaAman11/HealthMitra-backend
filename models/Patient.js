import mongoose, { Schema } from "mongoose";

const PatientSchema = new Schema({
  name: String,
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String, unique: true },
  preferredLanguage: String,
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Patient', PatientSchema);

