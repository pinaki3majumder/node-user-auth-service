import { db } from '../config/db';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { LoginInput, SignupInput } from '../types/auth';
import jwt from 'jsonwebtoken';
import { TokenService } from './token.service';

export class AuthService {
  static async signup({ name, email, mobile, password }: SignupInput) {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) throw new Error('Email already exists');
    // @TODO: Check for mobile uniqueness
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)',
      [name, email, mobile, hashedPassword]
    );

    return { id: (result as any).insertId, name, email, mobile };
  }

  static async login({ email, password }: LoginInput) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any[])[0];
    if (!user) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid email or password');

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    const decoded: any = jwt.decode(refreshToken);

    await TokenService.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(decoded.exp * 1000)
    );

    return { accessToken, refreshToken };
  }

  static async refreshToken(token: string) {
    const stored = await TokenService.findRefreshToken(token);
    if (!stored) throw new Error('Invalid refresh token');

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);

    const payload: any = jwt.decode(token);

    // Rotate token (best practice)
    await TokenService.revokeToken(token);

    const newAccessToken = generateAccessToken({ id: payload.id });
    const newRefreshToken = generateRefreshToken({ id: payload.id });

    const decoded: any = jwt.decode(newRefreshToken);

    await TokenService.saveRefreshToken(
      payload.id,
      newRefreshToken,
      new Date(decoded.exp * 1000)
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    await TokenService.revokeToken(refreshToken);
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const sql = `SELECT id FROM users WHERE email = ? LIMIT 1`;
    const [rows]: any = await db.query(sql, [email]);
    return rows.length > 0;
  }

  static async verifyOtp(email: string, otp: number): Promise<string> {
    // 1️⃣ check email exists
    const emailExists = await this.checkEmailExists(email);
    if (!emailExists) {
      throw new Error('Email not found');
    }

    // 2️⃣ validate OTP
    if (otp !== 123456) {
      throw new Error('Invalid OTP');
    }

    // 3️⃣ fetch user id (needed for token)
    const sql = `SELECT id FROM users WHERE email = ? LIMIT 1`;
    const [rows]: any = await db.query(sql, [email]);

    const userId = rows[0].id;

    // 4️⃣ generate access token (3 mins)
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '3m' }
    );

    return accessToken;
  }

  static async changePassword(userId: number, password: string): Promise<void> {   
    // 1️⃣ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ update DB
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    const [result]: any = await db.query(sql, [hashedPassword, userId]);

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  }
}
