import { db } from '../db.js';

const contractController = {
  async addContract({ employee_id, type, start_date, end_date, signed_by }) {
    await db.read();
    db.data.contracts ||= [];

    const newContract = {
      id: Date.now().toString(),
      employee_id,
      type,
      start_date,
      end_date,
      signed_by,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    db.data.contracts.push(newContract);
    await db.write();
    return newContract;
  },

  async getContracts({ employee_id, type }) {
    await db.read();
    let contracts = db.data.contracts || [];

    if (employee_id) contracts = contracts.filter(c => c.employee_id === employee_id);
    if (type) contracts = contracts.filter(c => c.type === type);

    return contracts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
};

export default contractController;
