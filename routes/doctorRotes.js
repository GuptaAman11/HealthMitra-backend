import express from 'express';
import { getDoctors, getSpecializations } from '../controller/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);

export default router;

