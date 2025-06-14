import express from 'express';
import Booking from '../models/Booking.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

router.post('/', async (req, res) => {
  const booking = new Booking(req.body);
  const saved = await booking.save();
  res.status(201).json(saved);
});

export default router;
