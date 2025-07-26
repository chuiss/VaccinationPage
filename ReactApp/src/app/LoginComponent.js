import React, { useState } from 'react';

export default function LoginComponent({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 };
  const buttonStyle = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' };

  const handleLogin = async e => {
    e.preventDefault();
    if (username && password) {
      try {
        // Fetch user from backend to determine role
        const res = await fetch('/api/users');
        const users = await res.json();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          setAuth({ loggedIn: true, role: user.role, username: user.username, name: user.name });
        } else {
          setError('Invalid username or password');
        }
      } catch (err) {
        setError('Login failed');
      }
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f8fa' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #2563eb22', minWidth: 320 }}>
        <h2 style={{ color: '#2563eb', marginBottom: 24, textAlign: 'center' }}>Login to Vaccina</h2>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={buttonStyle}>Login</button>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span>Don't have an account? </span>
          <a href="#" onClick={() => setAuth(auth => ({ ...auth, showRegister: true }))} style={{ color: '#2563eb', textDecoration: 'underline' }}>Register</a>
        </div>
      </form>
    </div>
  );
}
