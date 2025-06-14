import SPECIALIZATIONS from "../constant/specialization.constant.js";
import Doctor from "../models/Doctor.js";

export const getDoctors = async (req, res) => {
  const { preferredLanguage, preferredSpecialization } = req.query;
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  try {
    const doctors = await Doctor.find({
      ...(preferredLanguage && {languages: { $in: [preferredLanguage] } }),
      ...(preferredSpecialization && { specialization: { $in: [preferredSpecialization] } }),
      availability: { 
        $elemMatch: { 
          day: today, 
          slots: { $elemMatch: { $gte: currentTime } }
        }
      }
    })
      .select('name languages specialization availability')
      .lean();

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors', error: err.message });
  }
};


export const getSpecializations = async (req, res) => {
  try {
    const specializations = SPECIALIZATIONS;
    res.json(specializations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching specializations', error: err.message });
  }
}