import { db } from '../db.js';

const VALID_BRANCHES = [
  'Head Office',
  'Kirehe Branch',
  'Gatsibo Branch',
  'Mahama Water Treatment Plant'
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function ensureDbShape() {
  db.data ||= {};
  db.data.branches ||= [];

  const roleMap = {
    'Head Office': [/* roles */],
    'Kirehe Branch': [/* roles */],
    'Gatsibo Branch': [/* roles */],
    'Mahama Water Treatment Plant': [/* roles */]
  };

  for (const branchName of VALID_BRANCHES) {
    const existing = db.data.branches.find((b) => b.branch === branchName);
    if (!existing) {
      db.data.branches.push({
        branch: branchName,
        roles: roleMap[branchName].map((role) => ({
          id: uid(),
          role,
          name: ''
        }))
      });
    }
  }
}

const Branches = {
  async init() {
    await db.read();
    ensureDbShape();
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
    const decoded = decodeURIComponent(branchName);
    return db.data.branches.find((b) => b.branch === decoded) || null;
  },

  async addRole(branchName, payload) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');
    if (!payload?.role || typeof payload.role !== 'string') throw new Error('Role is required');

    const entry = {
      id: uid(),
      role: payload.role,
      name: payload.name || ''
    };

    branch.roles.push(entry);
    await db.write();
    return entry;
  },

  async updateRole(branchName, entryId, payload) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    const idx = branch.roles.findIndex((x) => x.id === entryId);
    if (idx === -1) throw new Error('Entry not found');

    if (payload?.role !== undefined) branch.roles[idx].role = payload.role;
    if (payload?.name !== undefined) branch.roles[idx].name = payload.name;

    await db.write();
    return branch.roles[idx];
  },

  async deleteRole(branchName, entryId) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    const idx = branch.roles.findIndex((x) => x.id === entryId);
    if (idx === -1) throw new Error('Entry not found');

    const [removed] = branch.roles.splice(idx, 1);
    await db.write();
    return removed;
  },

  async getUnassignedRoles(branchName) {
    const decoded = decodeURIComponent(branchName);
    if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

    await db.read();
    ensureDbShape();

    const branch = db.data.branches.find((b) => b.branch === decoded);
    if (!branch) throw new Error('Branch not found');

    return branch.roles.filter((r) => !r.name || r.name.trim() === '');
  }
};

export default Branches;
