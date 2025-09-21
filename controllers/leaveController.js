import { db } from '../db.js';

const leaveController = {
  // 📥 Submit a new leave request
  async submitLeave({ employee_id, type, start_date, end_date, reason, submitted_by }) {
    await db.read();

    const newLeave = {
      id: Date.now().toString(),
      employee_id,
      type,
      start_date,
      end_date,
      reason: reason || '',
      status: 'pending',
      submitted_by,
      created_at: new Date().toISOString(),
      status_history: [
        {
          status: 'pending',
          changed_by: submitted_by,
          changed_at: new Date().toISOString(),
        },
      ],
      deleted: false,
    };

    db.data.leaveRequests ||= [];
    db.data.leaveRequests.push(newLeave);
    await db.write();

    return newLeave;
  },

  // 📤 Get leave requests with optional filters + pagination
  async getLeaves({ employee_id, status, page = 1, limit = 10 }) {
    await db.read();
    let leaves = db.data.leaveRequests || [];

    // Filter out soft-deleted records
    leaves = leaves.filter(l => !l.deleted);

    if (employee_id) {
      leaves = leaves.filter(l => l.employee_id === employee_id);
    }

    if (status) {
      leaves = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
    }

    // Sort by created_at descending
    leaves.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginated = leaves.slice(startIndex, startIndex + limit);

    return {
      total: leaves.length,
      page,
      limit,
      data: paginated,
    };
  },

  // ✅ Update leave status with history
  async updateLeaveStatus(id, status, changed_by) {
    await db.read();
    const leave = db.data.leaveRequests.find(l => l.id === id && !l.deleted);
    if (!leave) return null;

    leave.status = status.toLowerCase();
    leave.status_history ||= [];
    leave.status_history.push({
      status: leave.status,
      changed_by,
      changed_at: new Date().toISOString(),
    });

    await db.write();
    return leave;
  },

  // 🗑️ Soft delete a leave request
  async softDeleteLeave(id, deleted_by) {
    await db.read();
    const leave = db.data.leaveRequests.find(l => l.id === id && !l.deleted);
    if (!leave) return null;

    leave.deleted = true;
    leave.deleted_by = deleted_by;
    leave.deleted_at = new Date().toISOString();

    await db.write();
    return leave;
  },
};

export default leaveController;
