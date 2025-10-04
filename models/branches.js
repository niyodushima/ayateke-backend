import { db } from '../db.js';

const VALID_BRANCHES = [
  'Head Office',
  'Kirehe Branch',
  'Gatsibo Branch',
  'Mahama Water Treatment Plant'
];

const VALID_TABLES = ['staff', 'schemeManagers', 'plumbers'];

function ensureDbShape() {
  db.data ||= {};
  db.data.branches ||= [];

  for (const b of VALID_BRANCHES) {
    const existing = db.data.branches.find((x) => x.branch === b);
    if (!existing) {
      db.data.branches.push({
        branch: b,
        staff: [],
        schemeManagers: [],
        plumbers: []
      });
    }
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const Branches = {
  async init() {
    await db.read();
    ensureDbShape();
    await db.write();
    return db.data.branches;
  },

async seedStaffRoles() {
  await db.read();
  ensureDbShape();

  const roleMap = {
    'Head Office': [
      'Managing Director',
      'Permanent Secretary',
      'Director of Finance and Administration',
      'Logistician and Store Keeper',
      'Chief Accountant',
      'Human Resource Officer',
      'Internal Auditor',
      'Tax Officer',
      'IT Officer',
      'Chief Driver',
      'Accountant',
      'Electromechanician',
      'Assistant Chief Driver',
      'Driver',
      'Cleaner'
    ],
    'Kirehe Branch': [
      'Branch Manager',
      'Head of Technical Team',
      'Chief Recovery Officer',
      'Field Inspection Officer',
      'Electromechanician',
      'Accountant',
      'Recovery Officer',
      'Store Keeper and Cashier',
      'Scheme Manager & Driver',
      'Scheme Manager',
      'Pump Operator',
      'Plumber & Driver',
      'Plumber',
      'Plumber Assistant',
      'Chlorine Mixer',
      'Driver Vehicle',
      'Driver Moto',
      'Cleaner',
      'Security Guard'
    ],
    'Gatsibo Branch': [
      'Branch Manager',
      'Head of Technical Team',
      'Billing and Recovery Monitor',
      'Scheme Manager & Driver',
      'Scheme Manager',
      'Plumber & Driver',
      'Plumber',
      'Pump Operator',
      'Driver Vehicle',
      'Driver Moto',
      'Security Guard',
      'Cleaner'
    ],
    'Mahama Water Treatment Plant': [
      'Water Treatment Plant Manager',
      'Water Supply Engineer',
      'Accountant',
      'Electromechanician',
      'Water Quality Engineer',
      'Electromechanic Engineer',
      'Assistant Electromechanician',
      'Pump Operator',
      'Driver Vehicle',
      'Laboratory Operator'
    ]
  };

  for (const branch of db.data.branches) {
    const roles = roleMap[branch.branch] || [];
    for (const role of roles) {
      const exists = branch.staff.some((s) => s.role === role);
      if (!exists) {
        branch.staff.push({
          id: uid(),
          role,
          name: ''
        });
      }
    }
  }

  await db.write();
  return db.data.branches;
}


  async list() {
    await db.read();
    ensureDbShape();
    return db.data.branches;
  },

  async get(branchName) {
    await db.read();
    ensureDbShape();
    const decoded = decodeURIComponent(branchName);
    return db.data.branches.find((b) => b.branch === decoded) || null;
  },

  async addEntry(branchName, tableName, payload) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');
    if (!VALID_TABLES.includes(tableName)) throw new Error('Invalid table name');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    const entry = { id: uid() };

    if (tableName === 'staff') {
      if (!payload?.role) {
        console.error('Missing role in payload:', payload);
        throw new Error('Role is required');
      }
      entry.role = payload.role;
      entry.name = payload?.name || '';
    } else {
      if (!payload?.name) {
        console.error('Missing name in payload:', payload);
        throw new Error('Name is required');
      }
      entry.name = payload.name;
    }

    branch[tableName].push(entry);
    await db.write();
    return entry;
  },

  async updateEntry(branchName, tableName, entryId, payload) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');
    if (!VALID_TABLES.includes(tableName)) throw new Error('Invalid table name');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    const list = branch[tableName];
    const idx = list.findIndex((x) => x.id === entryId);
    if (idx === -1) throw new Error('Entry not found');

    if (tableName === 'staff') {
      if (payload?.role !== undefined) list[idx].role = payload.role;
      if (payload?.name !== undefined) list[idx].name = payload.name;
    } else {
      if (payload?.name !== undefined) list[idx].name = payload.name;
    }

    await db.write();
    return list[idx];
  },

  async deleteEntry(branchName, tableName, entryId) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');
    if (!VALID_TABLES.includes(tableName)) throw new Error('Invalid table name');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    const list = branch[tableName];
    const idx = list.findIndex((x) => x.id === entryId);
    if (idx === -1) throw new Error('Entry not found');

    const [removed] = list.splice(idx, 1);
    await db.write();
    return removed;
  }
};
 
export default Branches;
