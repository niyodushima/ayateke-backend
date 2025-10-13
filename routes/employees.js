import express from 'express';
import { body, validationResult } from 'express-validator';
import Employees from '../models/employees.js';

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Initialize employee store (optional)
router.post('/init', async (_req, res) => {
  try {
    const data = await Employees.init();
    res.json({ message: 'Employees initialized', data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize employees' });
  }
});

// List all employees
router.get('/', async (_req, res) => {
  try {
    const employees = await Employees.list();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list employees' });
  }
});

// Get single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const emp = await Employees.get(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get employee' });
  }
});

// Add new employee
router.post(
  '/',
  [
    body('name').isString(),
    body('email').optional().isString(),
    body('tel').optional().isString(),
    body('address').optional().isString(),
    body('gender').optional().isString(),
    body('role').optional().isString(),
    body('branch').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const entry = await Employees.add(req.body);
      res.status(201).json({ message: 'Employee added', data: entry });
    } catch (err) {
      console.error('Add employee error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Update employee
router.put(
  '/:id',
  [
    body('name').optional().isString(),
    body('email').optional().isString(),
    body('tel').optional().isString(),
    body('address').optional().isString(),
    body('gender').optional().isString(),
    body('role').optional().isString(),
    body('branch').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updated = await Employees.update(req.params.id, req.body);
      res.json({ message: 'Employee updated', data: updated });
    } catch (err) {
      console.error('Update employee error:', err.message);
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
);

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Employees.remove(req.params.id);
    res.json({ message: 'Employee deleted', data: removed });
  } catch (err) {
    console.error('Delete employee error:', err.message);
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// Attach document to employee
router.post(
  '/:id/documents',
  [body('name').isString(), body('type').optional().isString()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const docs = await Employees.addDocument(req.params.id, req.body);
      res.json({ message: 'Document attached', data: docs });
    } catch (err) {
      console.error('Attach document error:', err.message);
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
);

export default router;
