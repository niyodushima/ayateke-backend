import { db } from '../db.js';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function ensureDbShape() {
  db.data ||= {};
  db.data.employees ||= [];
}

async function init() {
  await db.read();
  ensureDbShape();
  await db.write();
  return db.data.employees;
}

async function list() {
  await db.read();
  ensureDbShape();
  return db.data.employees;
}

async function get(id) {
  await db.read();
  ensureDbShape();
  return db.data.employees.find((e) => e.id === id) || null;
}

async function add(payload) {
  await db.read();
  ensureDbShape();

  const newEntry = {
    id: uid(),
    name: payload.name || '',
    email: payload.email || '',
    tel: payload.tel || '',
    address: payload.address || '',
    gender: payload.gender || '',
    role: payload.role || '',
    branch: payload.branch || '',
    education: payload.education || '', // ✅ NEW FIELD
    work_experience: payload.work_experience || '',
    documents: [] // ✅ Already supported
  };

  db.data.employees.push(newEntry);
  await db.write();
  return newEntry;
}

async function update(id, payload) {
  await db.read();
  ensureDbShape();

  const emp = db.data.employees.find((e) => e.id === id);
  if (!emp) throw new Error('Employee not found');

  if (payload?.name !== undefined) emp.name = payload.name;
  if (payload?.email !== undefined) emp.email = payload.email;
  if (payload?.tel !== undefined) emp.tel = payload.tel;
  if (payload?.address !== undefined) emp.address = payload.address;
  if (payload?.gender !== undefined) emp.gender = payload.gender;
  if (payload?.role !== undefined) emp.role = payload.role;
  if (payload?.branch !== undefined) emp.branch = payload.branch;
  if (payload?.education !== undefined) emp.education = payload.education; // ✅ NEW FIELD
  if (payload?.work_experience !== undefined) emp.work_experience = payload.work_experience;

  await db.write();
  return emp;
}

async function remove(id) {
  await db.read();
  ensureDbShape();
  const idx = db.data.employees.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Employee not found');
  const [removed] = db.data.employees.splice(idx, 1);
  await db.write();
  return removed;
}

async function addDocument(id, docMeta) {
  await db.read();
  ensureDbShape();
  const emp = db.data.employees.find((e) => e.id === id);
  if (!emp) throw new Error('Employee not found');

  emp.documents ||= [];
  emp.documents.push({
    id: uid(),
    name: docMeta.name || 'Untitled',
    type: docMeta.type || 'Unknown',
    uploadedAt: new Date().toISOString()
  });

  await db.write();
  return emp.documents;
}

const Employees = {
  init,
  list,
  get,
  add,
  update,
  remove,
  addDocument
};

export default Employees;
