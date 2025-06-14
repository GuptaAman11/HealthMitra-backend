// controllers/userController.js
import  { LANGUAGES } from '../constant/language.constant.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const getProfile = async (req, res) => {
  const loggedInUser = req.user;
  try {
    let userModel = loggedInUser.userType === 'Doctor' ? Doctor : Patient;
    const user = await userModel.findById(loggedInUser?.userDetails?._id || loggedInUser.id);
    if (!user) return res.status(404).json({ message: `${loggedInUser.userType} not found` });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
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
