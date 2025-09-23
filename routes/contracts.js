import express from 'express';
import { body, validationResult } from 'express-validator';
import contractController from '../controllers/contractController.js';

const router = express.Router();

// 📥 POST: Add a new contract
router.post(
  '/',
  [
    body('employee_id').notEmpty(),
    body('type').isIn(['permanent', 'temporary', 'intern']).withMessage('Invalid contract type'),
    body('start_date').isISO8601(),
    body('end_date').isISO8601(),
    body('signed_by').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const contract = await contractController.addContract(req.body);
      res.status(201).json({ message: 'Contract added', data: contract });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add contract' });
    }
  }
);

// 📤 GET: Retrieve contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await contractController.getContracts(req.query);
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

export default router;
