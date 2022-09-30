import express from 'express';
import { createCustomer, listCustomer, listCustomers, updateCustomer } from '../controllers/customers.controller.js';

const router = express.Router();

router.post('/customers', createCustomer);
router.get('/customers', listCustomers);
router.get('/customers/:id', listCustomer);
router.put('/customers/:id', updateCustomer);

export default router;