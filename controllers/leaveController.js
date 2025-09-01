import { db } from '../db.js';

const leaveController = {
  // 📥 Submit a new leave request
  async submitLeave({ employee_id, type, start_date, end_date, reason }) {
    await db.read();

    const newLeave = {
      id: Date.now().toString(), // unique ID
      employee_id,
      type,
      start_date,
      end_date,
      reason: reason || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    db.data.leaveRequests ||= [];
    db.data.leaveRequests.push(newLeave);
    await db.write();

    return newLeave;
  },

  // 📤 Get leave requests with optional filters
  async getLeaves({ employee_id, status }) {
    await db.read();
    let leaves = db.data.leaveRequests || [];

    if (employee_id) {
      leaves = leaves.filter(l => l.employee_id === employee_id);
    }

    if (status) {
      leaves = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
    }

    // Optional: sort by created_at descending
    leaves.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return leaves;
  },

  // ✅ Update leave status
  async updateLeaveStatus(id, status) {
    await db.read();
    const leave = db.data.leaveRequests.find(l => l.id === id);
    if (!leave) return null;

    leave.status = status.toLowerCase();
    await db.write();

    return leave;
  },

  // 🗑️ Delete a leave request
  async deleteLeave(id) {
    await db.read();
    const index = db.data.leaveRequests.findIndex(l => l.id === id);
    if (index === -1) return null;

    const [deleted] = db.data.leaveRequests.splice(index, 1);
    await db.write();

    return deleted;
  }
};

export default leaveController;
