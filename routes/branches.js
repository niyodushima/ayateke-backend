import express from 'express';
import { body, validationResult } from 'express-validator';
import Branches from '../models/branches.js';

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/init', async (_req, res) => {
  try {
    const data = await Branches.init();
    res.json({ message: 'Branches initialized', data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize branches' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const branches = await Branches.list();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list branches' });
  }
});

router.get('/:branchName', async (req, res) => {
  try {
    const branch = await Branches.get(req.params.branchName);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get branch' });
  }
});

router.get('/:branchName/unassigned', async (req, res) => {
  try {
    const roles = await Branches.getUnassignedRoles(req.params.branchName);
    res.json(roles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post(
  '/:branchName/roles',
  [body('role').isString(), body('name').optional().isString()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const entry = await Branches.addRole(req.params.branchName, req.body);
      res.status(201).json({ message: 'Role added', data: entry });
    } catch (err) {
      console.error('Add role error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  '/:branchName/roles/:entryId',
  [body('role').optional().isString(), body('name').optional().isString()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updated = await Branches.updateRole(req.params.branchName, req.params.entryId, req.body);
      res.json({ message: 'Role updated', data: updated });
    } catch (err) {
      console.error('Update role error:', err.message);
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
);

router.delete('/:branchName/roles/:entryId', async (req, res) => {
  try {
    const removed = await Branches.deleteRole(req.params.branchName, req.params.entryId);
    res.json({ message: 'Role deleted', data: removed });
  } catch (err) {
    console.error('Delete role error:', err.message);
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

export default router;
