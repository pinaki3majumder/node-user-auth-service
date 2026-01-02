import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // only if you use cookies / auth headers
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api', customerRoutes);

export default app;
