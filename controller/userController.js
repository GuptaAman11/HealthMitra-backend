// controllers/userController.js
import  { LANGUAGES } from '../constant/language.constant.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const getProfile = async (req, res) => {
  try {
    const { userType, userDetails, id } = req.user;
    const userModel = userType === 'Doctor' ? Doctor : Patient;
    const userId = userDetails?._id || id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `${userType} not found` });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { userType, id, userDetails } = req.user;

  try {
    let userModel = userType === 'Doctor' ? Doctor : Patient;
    const { phone, ...update } = req.body;

    const updated = await userModel.findByIdAndUpdate(
      userDetails._id || id,
      update,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: `${userType} not found` });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

export const getLanguages = async (req, res) => {
  try {
    const languages = LANGUAGES; 
    res.json(languages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching languages', error: err.message });
  }
};