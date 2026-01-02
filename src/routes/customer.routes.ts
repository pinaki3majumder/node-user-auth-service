import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/customers', authenticate, CustomerController.getCustomers);

export default router;
