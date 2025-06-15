// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const signup = async (req, res) => {
  const { name, phone, password, userType, email, ...rest } = req.body;
  console.log(req.body)
  try {
    const existingUser = await AuthUser.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: 'Phone already exists' });
    const userModal = userType == 'Patient' ? Patient : Doctor;
    const existingUserEmail =  await userModal.findOne({ email });
    if (existingUserEmail) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    let userRef;

    if (userType === 'Patient') {
      userRef = await Patient.create({ name, phone, email, ...rest });
    } else if (userType === 'Doctor') {
      userRef = await Doctor.create({ name, phone, email, ...rest });
    }
    else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const authUser = await AuthUser.create({
      userType,
      refId: userRef._id,
      phone,
      password: hashedPassword
    });

    const token = jwt.sign({ id: authUser._id, userType, userDetails: userRef }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, userType, refId: userRef });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
};

export const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await AuthUser.findOne({ phone })
      .populate('refId', '-password -__v');
      
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, userType: user.userType , userDetails: user.refId}, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, userType: user.userType, userDetails: user.refId });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};
