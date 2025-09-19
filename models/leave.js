import { db } from '../db.js'; // ✅ lowdb named export

const Leave = {
  /**
   * Get all leave requests, optionally filtered
   */
  async getRequests({ employee_id, status } = {}) {
    try {
      await db.read();
      let requests = db.data.leave_requests || [];

      if (employee_id) {
        requests = requests.filter((r) => r.employee_id === employee_id);
      }
      if (status) {
        requests = requests.filter((r) => r.status === status);
      }

      return requests.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      throw err;
    }
  },

  /**
   * Add a new leave request
   */
  async addRequest({ employee_id, start_date, end_date, reason, type }) {
    try {
      await db.read();
      db.data.leave_requests ||= [];

      const newRequest = {
        id: Date.now(),
        employee_id,
        start_date,
        end_date,
        reason,
        type: type || 'General',
        status: 'Pending',
        created_at: new Date().toISOString(),
      };

      db.data.leave_requests.push(newRequest);
      await db.write();

      console.log('✅ Leave request saved:', newRequest);
      return newRequest;
    } catch (err) {
      console.error('Error adding leave request:', err.message);
      throw err;
    }
  },

  /**
   * Update status of a leave request
   */
  async updateStatus({ id, status }) {
    try {
      await db.read();
      db.data.leave_requests ||= [];

      const request = db.data.leave_requests.find((r) => r.id === id);
      if (!request) return null;

      request.status = status;
      await db.write();

      console.log('✅ Leave status updated:', request);
      return request;
    } catch (err) {
      console.error('Error updating leave status:', err.message);
      throw err;
    }
  },
};

export default Leave;
