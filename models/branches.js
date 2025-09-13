// backend/models/branches.js
import { db } from '../db.js';

const VALID_BRANCHES = ['Gatsibo', 'Kirehe', 'Kigali'];
const VALID_TABLES = ['staff', 'schemeManagers', 'plumbers'];

function ensureDbShape() {
  db.data ||= {};
  db.data.branches ||= [];
  // Ensure all expected branches exist
  for (const b of VALID_BRANCHES) {
    const existing = db.data.branches.find((x) => x.branch === b);
    if (!existing) {
      db.data.branches.push({
        branch: b,
        staff: [],           // entries: { id, role, name }
        schemeManagers: [],  // entries: { id, name }
        plumbers: [],        // entries: { id, name }
      });
    }
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const Branches = {
  // Initialize with empty structure (idempotent)
  async init() {
    await db.read();
    ensureDbShape();
    await db.write();
    return db.data.branches;
  },

  // Optional: seed predefined staff roles with blank names
  async seedStaffRoles() {
    await db.read();
    ensureDbShape();

    const roles = [
      'Branch Manager',
      'Managing Director',
      'Human Resource',
      'Director Administrative of Finance',
      'Accountant',
    ];

    for (const branch of db.data.branches) {
      for (const role of roles) {
        const exists = branch.staff.some((s) => s.role === role);
        if (!exists) {
          branch.staff.push({
            id: uid(),
            role,
            name: '', // fill later
          });
        }
      }
    }

    await db.write();
    return db.data.branches;
  },

  async list() {
    await db.read();
    ensureDbShape();
    return db.data.branches;
  },

  async get(branchName) {
    await db.read();
    ensureDbShape();
    return db.data.branches.find((b) => b.branch === branchName) || null;
  },

  async addEntry(branchName, tableName, payload) {
    if (!VALID_BRANCHES.includes(branchName)) {
      throw new Error('Invalid branch');
    }
    if (!VALID_TABLES.includes(tableName)) {
      throw new Error('Invalid table name');
    }

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === branchName);
    if (!branch) throw new Error('Branch not found');

    const entry = { id: uid() };
    if (tableName === 'staff') {
      // Expect { role, name }
      if (!payload?.role) throw new Error('Role is required');
      entry.role = payload.role;
      entry.name = payload?.name || '';
    } else {
      // Expect { name }
      if (!payload?.name) throw new Error('Name is required');
      entry.name = payload.name;
    }

    branch[tableName].push(entry);
    await db.write();
    return entry;
  },

  async updateEntry(branchName, tableName, entryId, payload) {
    if (!VALID_BRANCHES.includes(branchName)) {
      throw new Error('Invalid branch');
    }
    if (!VALID_TABLES.includes(tableName)) {
      throw new Error('Invalid table name');
    }

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === branchName);
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
    if (!VALID_BRANCHES.includes(branchName)) {
      throw new Error('Invalid branch');
    }
    if (!VALID_TABLES.includes(tableName)) {
      throw new Error('Invalid table name');
    }

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === branchName);
    if (!branch) throw new Error('Branch not found');

    const list = branch[tableName];
    const idx = list.findIndex((x) => x.id === entryId);
    if (idx === -1) throw new Error('Entry not found');

    const [removed] = list.splice(idx, 1);
    await db.write();
    return removed;
  },
};

export default Branches;
