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

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)',
      [name, email, mobile, hashedPassword]
    );

    return { id: (result as any).insertId, name, email, mobile };
  }

  // static async login({ email, password }: LoginInput) {
  //   const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  //   const user = (rows as any[])[0];
  //   if (!user) throw new Error('Invalid email or password');

  //   const valid = await bcrypt.compare(password, user.password);
  //   if (!valid) throw new Error('Invalid email or password');

  //   const accessToken = generateAccessToken({ id: user.id, email: user.email });
  //   const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  //   return { accessToken, refreshToken };
  // }

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

}
