import express from 'express';
import { getDoctors, getSpecializations } from '../controller/doctorController.js';
import Doctor from '../models/Doctor.js'; // Import the Doctor model
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/alldoctor' , protect ,async (req, res) => {
    try {
      const doctors = await Doctor.find().lean(); // Use `.lean()` for performance if you don't need Mongoose documents
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
    }
  });
export default router;

 