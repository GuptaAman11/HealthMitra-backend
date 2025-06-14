// controllers/userController.js
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const getProfile = async (req, res) => {
  const { userType, id } = req.user;

  try {
    let userModel = userType === 'Doctor' ? Doctor : Patient;
    const user = await userModel.findById(req.userDetails.refId || id);
    if (!user) return res.status(404).json({ message: `${userType} not found` });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { userType, id } = req.user;

  try {
    let userModel = userType === 'Doctor' ? Doctor : Patient;
    const updated = await userModel.findByIdAndUpdate(
      req.userDetails.refId || id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: `${userType} not found` });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
