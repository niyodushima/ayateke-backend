import { db } from '../db.js';

const VALID_BRANCHES = [
  'Head Office',
  'Kirehe Branch',
  'Gatsibo Branch',
  'Mahama Water Treatment Plant',
  'WATERAID PROJECT'
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
    'Mahama Water Treatment Plant': [/* roles */],
    'WATERAID PROJECT': [/* roles */]
  };

  for (const branchName of VALID_BRANCHES) {
    const existing = db.data.branches.find((b) => b.branch === branchName);
    if (!existing) {
      db.data.branches.push({
        branch: branchName,
        roles: roleMap[branchName].map((role) => ({
          id: uid(),
          role,
          name: '',
          email: '',
          tel: '',
          address: '',
          gender: '',
          documents: [] // ✅ NEW
        }))
      });
    }
  }
}

async function init() {
  await db.read();
  ensureDbShape();
  await db.write();
  return db.data.branches;
}

async function list() {
  await db.read();
  ensureDbShape();
  return db.data.branches;
}

async function get(branchName) {
  await db.read();
  ensureDbShape();
  const decoded = decodeURIComponent(branchName);
  return db.data.branches.find((b) => b.branch === decoded) || null;
}

async function addRole(branchName, payload) {
  const decoded = decodeURIComponent(branchName);
  if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

  await db.read();
  ensureDbShape();

  const branch = db.data.branches.find((b) => b.branch === decoded);
  if (!branch) throw new Error('Branch not found');
  if (!payload?.role || typeof payload.role !== 'string') throw new Error('Role is required');

  let existing = branch.roles.find((r) => r.role === payload.role);

  if (!existing) {
    existing = {
      id: uid(),
      role: payload.role,
      name: '',
      email: '',
      tel: '',
      address: '',
      gender: '',
      documents: [] // ✅ NEW
    };
    branch.roles.push(existing);
  }

  existing.name = payload.name || '';
  existing.email = payload.email || '';
  existing.tel = payload.tel || '';
  existing.address = payload.address || '';
  existing.gender = payload.gender || '';

  await db.write();
  return existing;
}

async function updateRole(branchName, entryId, payload) {
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
  if (payload?.email !== undefined) branch.roles[idx].email = payload.email;
  if (payload?.tel !== undefined) branch.roles[idx].tel = payload.tel;
  if (payload?.address !== undefined) branch.roles[idx].address = payload.address;
  if (payload?.gender !== undefined) branch.roles[idx].gender = payload.gender;

  await db.write();
  return branch.roles[idx];
}

async function deleteRole(branchName, entryId) {
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
}

async function getUnassignedRoles(branchName) {
  const decoded = decodeURIComponent(branchName);
  if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

  await db.read();
  ensureDbShape();

  const branch = db.data.branches.find((b) => b.branch === decoded);
  if (!branch) throw new Error('Branch not found');

  return branch.roles.filter((r) => !r.name || r.name.trim() === '');
}

async function addDocument(branchName, entryId, docMeta) {
  const decoded = decodeURIComponent(branchName);
  if (!VALID_BRANCHES.includes(decoded)) throw new Error('Invalid branch');

  await db.read();
  ensureDbShape();

  const branch = db.data.branches.find((b) => b.branch === decoded);
  if (!branch) throw new Error('Branch not found');

  const role = branch.roles.find((r) => r.id === entryId);
  if (!role) throw new Error('Role not found');

  role.documents ||= [];
  role.documents.push({
    id: uid(),
    name: docMeta.name || 'Untitled',
    type: docMeta.type || 'Unknown',
    uploadedAt: new Date().toISOString()
  });

  await db.write();
  return role.documents;
}

const Branches = {
  init,
  list,
  get,
  addRole,
  updateRole,
  deleteRole,
  getUnassignedRoles,
  addDocument // ✅ NEW
};

export default Branches;
