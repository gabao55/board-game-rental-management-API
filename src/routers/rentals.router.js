import express from 'express';
import { createRental, deleteRental, finishRental, listRentals } from '../controllers/rentals.controller.js';

const router = express.Router();

router.get('/rentals', listRentals);
router.post('/rentals', createRental);
router.post('/rentals/:id/return', finishRental);
router.delete('/rentals/:id', deleteRental);

export default router;