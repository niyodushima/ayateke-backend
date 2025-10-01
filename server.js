import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB } from './db.js';
import userRoutes from './routes/users.js';
import leaveRoutes from './routes/leaves.js';
import attendanceRoutes from './routes/attendance.js';
import branchRoutes from './routes/branches.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS for frontend
app.use(cors({
  origin: 'https://ayateke-frontend.vercel.app'
}));

app.use(bodyParser.json());

// ✅ Mount all routes
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api', authRoutes);
// ✅ Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
