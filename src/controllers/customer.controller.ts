import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string) || '';

      const data = await CustomerService.getCustomers({
        page,
        limit,
        search,
      });

      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
