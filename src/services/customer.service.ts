import { db } from '../config/db';

interface GetCustomersParams {
  page: number;
  limit: number;
  search: string;
}

export class CustomerService {
  static async getCustomers({ page, limit, search }: GetCustomersParams) {
    const offset = (page - 1) * limit;

    const searchValue = `%${search}%`;

    const [rows] = await db.query(
      `
      SELECT name, phone, email, address, postalZip, region, country, list
      FROM customers
      WHERE (
        name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
        OR country LIKE ?
        OR region LIKE ?
      )
      ORDER BY name
      LIMIT ? OFFSET ?
      `,
      [
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        limit,
        offset,
      ]
    );

    const [countResult] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM customers
      WHERE (
        name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
        OR country LIKE ?
        OR region LIKE ?
      )
      `,
      [
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      ]
    );

    const total = (countResult as any[])[0].total;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
