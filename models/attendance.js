import { db } from '../db.js'; // ✅ lowdb named export

const Attendance = {
  /**
   * Get all logs, sorted by created_at (newest first)
   */
  async getLogs({ employee_id, date } = {}) {
    try {
      await db.read();
      let logs = db.data.attendance_logs || [];

      if (employee_id) {
        logs = logs.filter((r) => r.employee_id === employee_id);
      }
      if (date) {
        logs = logs.filter((r) => r.date === date);
      }

      return logs.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (err) {
      console.error('Error fetching logs:', err);
      throw err;
    }
  },

  /**
   * Add a new attendance log
   */
  async addLog({ employee_id, date, clock_in, clock_out }) {
    try {
      await db.read();
      db.data.attendance_logs ||= [];

      const newLog = {
        id: Date.now(),
        employee_id,
        date,
        clock_in,
        clock_out,
        created_at: new Date().toISOString(),
      };

      db.data.attendance_logs.push(newLog);
      await db.write();

      return newLog;
    } catch (err) {
      console.error('Error adding log:', err);
      throw err;
    }
  },

  /**
   * Update clock_out for an existing record with clock_out === '00:00'
   */
  async updateClockOut({ employee_id, date, clock_out }) {
    try {
      await db.read();
      db.data.attendance_logs ||= [];

      const record = db.data.attendance_logs.find(
        (r) =>
          r.employee_id === employee_id &&
          r.date === date &&
          r.clock_out === '00:00'
      );

      if (!record) {
        console.warn('⚠️ No matching check-in found for checkout');
        return null;
      }

      record.clock_out = clock_out;
      await db.write();

      return record;
    } catch (err) {
      console.error('Error updating clock_out:', err);
      throw err;
    }
  },
};

export default Attendance;
