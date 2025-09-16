import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDB } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'https://ayateke-frontend.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.options('*', cors());
app.use(express.json());

// ✅ Import routes
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import staffRoutes from './routes/staff.js';
import salaryRoutes from './routes/salaries.js';
import branchesRouter from './routes/branches.js';

// ✅ Mount routes
app.use('/api', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/branches', branchesRouter);

// ✅ Serve static files
app.use('/uploads', express.static('uploads'));

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Ayateke HR backend is running');
});

// ✅ Users list
app.get('/api/users', async (req, res) => {
  await db.read();
  const users = db.data.users.map(({ email, role }) => ({ email, role }));
  res.json(users);
});

// ✅ Start server
(async () => {
  try {
    await initDB();
    console.log('✅ LowDB initialized');
    app.listen(PORT, () => {
      console.log(`🚀 Ayateke HR backend is live at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize DB or start server:', err);
  }
})();
