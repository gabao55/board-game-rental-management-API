import express from 'express';
import { createCategorie, listCategories } from '../controllers/categories.controller.js';

const router = express.Router();

router.post('/categories', createCategorie);
router.get('/categories', listCategories);

export default router;