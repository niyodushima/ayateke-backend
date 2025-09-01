// backend/db.js
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const defaultData = {
  users: [
    { email: 'admin@ayateke.com', password: 'admin123', role: 'admin' },
    { email: 'staff@ayateke.com', password: 'staff123', role: 'staff' }
  ],
  leaveRequests: [],
  attendance_logs: []
};

const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export { db };
