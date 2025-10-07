import React, { useEffect, useState } from 'react';
import axios from 'axios';

const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #cbd5e0' };
const td = { padding: 10, verticalAlign: 'top' };

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') ||
  'https://ayateke-backend.onrender.com';

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '10px 14px', cursor: 'pointer', background: '#f7fafc', fontWeight: 600 }}
      >
        {title} {open ? '▼' : '►'}
      </div>
      {open && <div style={{ padding: 14 }}>{children}</div>}
    </div>
  );
}

function Table({ columns, rows, onDelete, onUpdate, onAttachFile }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#edf2f7' }}>
          {columns.map((c) => (
            <th key={c} style={th}>{c}</th>
          ))}
          <th style={th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {(!Array.isArray(rows) || rows.length === 0) && (
          <tr>
            <td colSpan={columns.length + 1} style={td}>No records</td>
          </tr>
        )}
        {(rows || []).map((r) => (
          <React.Fragment key={r.id}>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={td}>{r.role}</td>
              <td style={td}>{r.name || '—'}</td>
              <td style={td}>{r.email || '—'}</td>
              <td style={td}>{r.tel || '—'}</td>
              <td style={td}>{r.address || '—'}</td>
              <td style={td}>{r.gender || '—'}</td>
              <td style={td}>
                <button onClick={() => onUpdate(r)} style={{ marginRight: 8 }}>Edit</button>
                <button
                  onClick={() => onDelete(r.branch, r.id)}
                  style={{ color: 'white', background: '#e53e3e', border: 'none', padding: '6px 10px', borderRadius: 4 }}
                >
                  Delete
                </button>
                <label style={{ marginLeft: 8 }}>
                  <span style={{ cursor: 'pointer', color: '#3182ce' }}>Attach File</span>
                  <input type="file" hidden onChange={(e) => onAttachFile(e, r)} />
                </label>
              </td>
            </tr>
            {r.documents?.length > 0 && (
              <tr>
                <td colSpan={columns.length + 1} style={{ background: '#f9fafb', padding: '10px 14px' }}>
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: 6 }}>
                    <strong>📎 Attached Documents:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {r.documents.map((doc) => (
                        <li key={doc.id}>
                          {doc.name} ({doc.type}) — {new Date(doc.uploadedAt).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function AddForm({ branchName, onSubmit }) {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');

  const roleMap = {
    'head office': [...],
    'kirehe branch': [...],
    'gatsibo branch': [...],
    'mahama water treatment plant': [...],
    'wateraid project': [...]
  };

  const normalizedBranch = branchName.replace(/\s+/g, ' ').trim().toLowerCase();
  const availableRoles = roleMap[normalizedBranch] || ['Custom Role'];

  useEffect(() => {
    if (!role && availableRoles.length > 0) {
      setRole(availableRoles[0]);
    }
  }, [availableRoles, role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) return;
    onSubmit({ role, name, email, tel, address, gender });
    setName('');
    setEmail('');
    setTel('');
    setAddress('');
    setGender('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' }}>
      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, padding: 6 }} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: 6 }} />
      <input type="text" placeholder="Tel" value={tel} onChange={(e) => setTel(e.target.value)} style={{ flex: 1, padding: 6 }} />
      <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ flex: 1, padding: 6 }} />
      <select value={gender} onChange={(e) => setGender(e.target.value)} required style={{ flex: 1, padding: 6 }}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <button type="submit">Add</button>
    </form>
  );
}

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/branches`);
      setBranches(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Failed to load branches:', err);
      alert('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addEntry = async (branchName, payload) => {
    try {
      const res = await axios.post(`${API_BASE}/api/branches/${encodeURIComponent(branchName)}/roles`, payload);
      const newEntry = res.data?.data;
      setBranches((prev) =>
        prev.map((b) =>
          b.branch === branchName
            ? {
                ...b,
                roles: [newEntry, ...(b.roles || []).filter((r) => r.id !== newEntry.id)]
              }
            : b
        )
      );
    } catch (err) {
      console.error('Add entry failed:', err);
      alert(err.response?.data?.error || 'Add failed');
    }
  };

  const deleteEntry = async (branchName, id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`${API_BASE}/api/branches/${encodeURIComponent(branchName)}/roles/${id}`);
      await load();
    } catch (err) {
      console.error('Delete entry failed:', err);
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const updateEntry = async (record) => {
    const newName = window.prompt('Update name:', record.name || '');
    if (newName === null) return;

    const newRole = window.prompt('Update role:', record.role || '');
    if (newRole === null) return;

    try {
      await axios.put(`${API_BASE}/api/branches/${encodeURIComponent(record.branch)}/roles/${record.id}`, {
        name: newName,
        role: newRole
      });
      await load();
    } catch (err) {
          console.error('Update entry failed:', err);
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  const onAttachFile = async (e, record) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = window.prompt('Document name (e.g. CV, ID, Contract):');
    if (!name) return;

    try {
      await axios.post(`${API_BASE}/api/branches/${encodeURIComponent(record.branch)}/roles/${record.id}/documents`, {
        name,
        type: file.type
      });
      await load();
    } catch (err) {
      console.error('Attach failed:', err);
      alert(err.response?.data?.error || 'Attach failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ayateke HR — Admin Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        branches.map((b) => (
          <Section key={b.branch} title={b.branch}>
            <AddForm branchName={b.branch} onSubmit={(payload) => addEntry(b.branch, payload)} />
            <Table
              columns={['Role', 'Name', 'Email', 'Tel', 'Address', 'Gender']}
              rows={(b.roles || []).map((r) => ({ ...r, branch: b.branch }))}
              onDelete={deleteEntry}
              onUpdate={updateEntry}
              onAttachFile={onAttachFile}
            />
          </Section>
        ))
      )}
    </div>
  );
}
