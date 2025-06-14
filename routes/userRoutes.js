// routes/userRoutes.js
import express from 'express';
import { getProfile, updateProfile , getLanguages} from '../controller/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me/update', protect, updateProfile);
router.get('/languages', getLanguages);

export default router;
