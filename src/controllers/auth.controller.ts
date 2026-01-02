import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token required');

      const data = await AuthService.refreshToken(refreshToken);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await AuthService.logout(req.body.refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const exists = await AuthService.checkEmailExists(email);

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Email not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Email exists',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const token = await AuthService.verifyOtp(email, otp);

      return res.status(200).json({
        success: true,
        accessToken: token,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { password } = req.body;

      await AuthService.changePassword(userId, password);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
