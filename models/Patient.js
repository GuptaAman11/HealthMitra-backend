import mongoose, { Schema } from "mongoose";

const PatientSchema = new Schema({
  name: String,
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String, unique: true },
  preferredLanguage: String,
}, {
  timestamps: true
});


export default mongoose.model('Patient', PatientSchema);

