import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import Joi from 'joi';

const router = Router();

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().min(10).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Routes
router.post('/signup', validateRequest(signupSchema), AuthController.signup);
router.post('/login', validateRequest(loginSchema), AuthController.login);

export default router;
