import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ email, password, role });
  };

  return (
    <div>
      <h1>Welcome to AyateHub</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="hr">HR/Admin</option>
        </select>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
