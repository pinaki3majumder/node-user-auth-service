import { db } from '../config/db';

export class TokenService {
  static async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ) {
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );
  }

  static async findRefreshToken(token: string) {
    const [rows] = await db.query(
      `SELECT * FROM refresh_tokens
       WHERE token = ? AND revoked = false`,
      [token]
    );

    return (rows as any[])[0];
  }

  static async revokeToken(token: string) {
    await db.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token = ?`,
      [token]
    );
  }

  static async revokeAllForUser(userId: number) {
    await db.query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = ?`,
      [userId]
    );
  }
}
