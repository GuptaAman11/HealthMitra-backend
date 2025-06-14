// routes/userRoutes.js
import express from 'express';
import { getProfile, updateProfile } from '../controller/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me/update', protect, updateProfile);

export default router;
