import mongoose, { Schema } from "mongoose";
import SPECIALIZATIONS from "../constant/specialization.constant.js";

const DoctorSchema = new Schema({
    name: String,
    specialization: [{ type: String, enum: SPECIALIZATIONS },
    ],
    languages: [String],
    phone: { type: String, unique: true },
    experienceYears: Number,
    availability: [{
        day: String,
        slots: [String]
    }],
    about: String,
}, {
    timestamps: true
});

export default mongoose.model('Doctor', DoctorSchema);