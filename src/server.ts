import app from './app';

import cors from 'cors';

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // only if you use cookies / auth headers
  }),
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
