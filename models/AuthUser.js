import mongoose from 'mongoose';
const { Schema } = mongoose;

const AuthUserSchema = new Schema({
  userType: { type: String, enum: ['Patient', 'Doctor'], required: true },
  refId: { type: Schema.Types.ObjectId, required: true, refPath: 'userType' },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AuthUser', AuthUserSchema);
