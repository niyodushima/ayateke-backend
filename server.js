import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDB } from './db.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Allow production + local
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || 'https://ayateke-frontend.vercel.app',
  'http://localhost:3000',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman/cURL
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // set true only if you use cookies/auth headers
}));

// Preflight support
app.options('*', cors());

// Parsers and the rest
app.use(express.json());

// Routes
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import staffRoutes from './routes/staff.js';
import salaryRoutes from './routes/salaries.js';
import branchesRouter from './routes/branches.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/api/branches', branchesRouter);
// ✅ CORS: allow both local dev and Vercel frontend
app.use(cors({
  origin: [
    'https://ayateke-frontend.vercel.app', // production frontend
    'http://localhost:3000'                // local dev frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Parse JSON bodies
app.use(express.json());

(async () => {
  try {
    await initDB();
    console.log('✅ LowDB initialized');

    // ✅ Mount routes
    app.use('/api', authRoutes); // /api/login, /api/ping
    app.use('/api/attendance', attendanceRoutes); // /api/attendance/today, /checkin, /checkout
    app.use('/api/leaves', leaveRoutes);
    app.use('/api/staff', staffRoutes);
    app.use('/api/salaries', salaryRoutes);

    // ✅ Serve uploaded files
    app.use('/uploads', express.static('uploads'));

    // ✅ Health check
    app.get('/', (req, res) => {
      res.send('✅ Ayateke HR backend is running');
    });

    // ✅ Users list endpoint
    app.get('/api/users', async (req, res) => {
      await db.read();
      const users = db.data.users.map(({ email, role }) => ({ email, role }));
      res.json(users);
    });

    // ✅ Start server
    app.listen(PORT, () => {
      console.log(`🚀 Ayateke HR backend is live at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize DB or start server:', err);
  }
})();
