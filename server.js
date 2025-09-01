// backend/server.js
import express from 'express';
import cors from 'cors';
import { db, initDB } from './db.js'; // ✅ correct path to db.js

import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import authRoutes from './routes/auth.js';
import staffRoutes from './routes/staff.js';
import salaryRoutes from './routes/salaries.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

try {
  await initDB(); // ✅ initialize lowdb
  console.log('✅ LowDB initialized');
} catch (err) {
  console.error('❌ Failed to initialize DB:', err);
}

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
