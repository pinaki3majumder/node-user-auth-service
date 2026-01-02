import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import Joi from 'joi';
import { authenticate } from '../middlewares/auth.middleware';

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

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
});

export const changePasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
});

// Routes
router.post('/signup', validateRequest(signupSchema), AuthController.signup);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOtp);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;
