import express from 'express';
import Service from '../models/Service.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

router.post('/', async (req, res) => {
  const service = new Service(req.body);
  const saved = await service.save();
  res.status(201).json(saved);
});

export default router;
