// backend/models/attendance.js
import { db } from '../db.js'; // ✅ lowdb named export

const Attendance = {
  async getLogs() {
    try {
      await db.read();
      const logs = db.data.attendance_logs || [];
      return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error('Error fetching logs:', err);
      throw err;
    }
  },

  async addLog({ employee_id, date, clock_in, clock_out }) {
    try {
      await db.read();
      db.data.attendance_logs ||= [];

      const newLog = {
        id: Date.now(), // simple unique ID
        employee_id,
        date,
        clock_in,
        clock_out,
        created_at: new Date().toISOString()
      };

      db.data.attendance_logs.push(newLog);
      await db.write();

      return newLog;
    } catch (err) {
      console.error('Error adding log:', err);
      throw err;
    }
  },
};

export default Attendance;
