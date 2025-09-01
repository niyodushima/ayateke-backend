import express from 'express';
import cors from 'cors';
import { db, initDB } from './db.js';

import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import authRoutes from './routes/auth.js';
import staffRoutes from './routes/staff.js';
import salaryRoutes from './routes/salaries.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS for frontend on Vercel
app.use(cors({
  origin: 'https://ayateke-frontend.vercel.app',
  credentials: true
}));

app.use(express.json());

// ✅ Wrap initDB and server start in an async IIFE
(async () => {
  try {
    await initDB();
    console.log('✅ LowDB initialized');

    // Routes
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/leaves', leaveRoutes);
    app.use('/api', authRoutes);
    app.use('/api/staff', staffRoutes);
    app.use('/api/salaries', salaryRoutes);
    app.use('/uploads', express.static('uploads'));

    // Health check
    app.get('/', (req, res) => {
      res.send('✅ Ayateke HR backend is running');
    });

    app.get('/api/users', async (req, res) => {
      await db.read();
      const users = db.data.users.map(({ email, role }) => ({ email, role }));
      res.json(users);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Ayateke HR backend is live at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize DB or start server:', err);
  }
})();
