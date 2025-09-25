import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const defaultData = {
  users: [
    { email: 'admin@ayateke.com', password: 'admin123', role: 'admin' },
    { email: 'staff@ayateke.com', password: 'staff123', role: 'staff' }
  ],
  leaveRequests: [],
  attendance_logs: [],
  staff: [
    {
      id: '101',
      name: 'Alice Uwimana',
      email: 'alice@ayateke.com',
      branch: 'Head Office',
      department: 'HR',
      role: 'HR Manager',
      status: 'active'
    },
    {
      id: '102',
      name: 'Jean Bosco',
      email: 'jean@ayateke.com',
      branch: 'Mahama Water Treatment Plant',
      department: 'Engineering',
      role: 'Water Engineer',
      status: 'active'
    },
    {
      id: '103',
      name: 'Claudine Niyonsaba',
      email: 'claudine@ayateke.com',
      branch: 'Kirehe Branch',
      department: 'Field Operations',
      role: 'Technician',
      status: 'inactive'
    }
  ],
  contracts: [
    {
      employee_id: 'alice@ayateke.com',
      type: 'permanent',
      start_date: '2023-01-01',
      end_date: '2026-01-01',
      signed_by: 'CEO'
    }
  ],
  attendance: [
    {
      employee_id: 'alice@ayateke.com',
      date: '2025-09-23',
      status: 'Present'
    },
    {
      employee_id: 'alice@ayateke.com',
      date: '2025-09-24',
      status: 'Absent'
    }
  ],
  salaries: [
    {
      employee_id: 'alice@ayateke.com',
      month: 'August',
      year: '2025',
      amount: 850000
    },
    {
      employee_id: 'alice@ayateke.com',
      month: 'September',
      year: '2025',
      amount: 850000
    }
  ],
  branches: [
    {
      id: 'HO',
      name: 'Head Office',
      departments: ['Management', 'Finance', 'Logistics', 'HR', 'Procurement', 'IT']
    },
    {
      id: 'KIR',
      name: 'Kirehe Branch',
      departments: ['Field Operations', 'Community Liaison', 'Transport']
    },
    {
      id: 'GAT',
      name: 'Gatsibo Branch',
      departments: ['Field Operations', 'Community Liaison', 'Transport']
    },
    {
      id: 'MAH',
      name: 'Mahama Water Treatment Plant',
      departments: ['Water Treatment', 'Engineering', 'Pump Operations', 'Transport', 'Maintenance']
    }
  ]
};

const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export { db };
