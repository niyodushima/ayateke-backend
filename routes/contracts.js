import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import path from 'path';

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/contracts/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST /api/contracts/upload
router.post('/upload', upload.single('contract'), async (req, res) => {
  const { staff_id, start_date, end_date } = req.body;
  const file_url = `/uploads/contracts/${req.file.filename}`;

  try {
    await pool.query(
      `INSERT INTO contracts (staff_id, start_date, end_date, file_url, status)
       VALUES ($1, $2, $3, $4, 'Active')`,
      [staff_id, start_date, end_date, file_url]
    );
    res.json({ message: 'Contract uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload contract' });
  }
});

export default router;
