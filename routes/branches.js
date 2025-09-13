// backend/routes/branches.js
import express from 'express';
import { body, param } from 'express-validator';
import Branches from '../models/branches.js';

const router = express.Router();

const validTables = ['staff', 'schemeManagers', 'plumbers'];

function handleValidationErrors(req, res, next) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Init and optional seed endpoints (idempotent)
router.post('/init', async (_req, res) => {
  try {
    const data = await Branches.init();
    res.json({ message: 'Branches initialized', data });
  } catch (err) {
    console.error('Init error:', err);
    res.status(500).json({ error: 'Failed to initialize branches' });
  }
});

router.post('/seed-staff-roles', async (_req, res) => {
  try {
    const data = await Branches.seedStaffRoles();
    res.json({ message: 'Staff roles seeded', data });
  } catch (err) {
    console.error('Seed roles error:', err);
    res.status(500).json({ error: 'Failed to seed staff roles' });
  }
});

// GET all branches
router.get('/', async (_req, res) => {
  try {
    const branches = await Branches.list();
    res.json(branches);
  } catch (err) {
    console.error('List branches error:', err);
    res.status(500).json({ error: 'Failed to list branches' });
  }
});

// GET a single branch
router.get('/:branchName', async (req, res) => {
  try {
    const branch = await Branches.get(req.params.branchName);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    console.error('Get branch error:', err);
    res.status(500).json({ error: 'Failed to get branch' });
  }
});

// POST add entry to a table
router.post(
  '/:branchName/:tableName',
  [
    param('tableName').custom((t) => validTables.includes(t)),
    body('name').optional().isString(),
    body('role').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { branchName, tableName } = req.params;
    const { name, role } = req.body;

    try {
      const entry = await Branches.addEntry(branchName, tableName, { name, role });
      res.status(201).json({ message: 'Entry added', data: entry });
    } catch (err) {
      console.error('Add entry error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT update entry in a table
router.put(
  '/:branchName/:tableName/:entryId',
  [
    param('tableName').custom((t) => validTables.includes(t)),
    body('name').optional().isString(),
    body('role').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { branchName, tableName, entryId } = req.params;
    const { name, role } = req.body;

    try {
      const updated = await Branches.updateEntry(branchName, tableName, entryId, { name, role });
      res.json({ message: 'Entry updated', data: updated });
    } catch (err) {
      console.error('Update entry error:', err.message);
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
);

// DELETE entry in a table
router.delete(
  '/:branchName/:tableName/:entryId',
  [param('tableName').custom((t) => validTables.includes(t))],
  handleValidationErrors,
  async (req, res) => {
    const { branchName, tableName, entryId } = req.params;

    try {
      const removed = await Branches.deleteEntry(branchName, tableName, entryId);
      res.json({ message: 'Entry deleted', data: removed });
    } catch (err) {
      console.error('Delete entry error:', err.message);
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
);

export default router;
