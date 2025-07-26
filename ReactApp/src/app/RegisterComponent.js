import React, { useState } from 'react';

export default function RegisterComponent({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [disease, setDisease] = useState('');
  const [error, setError] = useState('');
  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 };
  const buttonStyle = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' };

  const handleRegister = async e => {
    e.preventDefault();
    if (username && password) {
      try {
        const userData = {
          username,
          password,
          name: username, // Optionally keep name as username or add a separate field for real name
          age: age ? Number(age) : undefined,
          profession,
          contact,
          address,
          gender,
          disease
        };
        console.log('Registering user with data:', userData);
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const result = await response.json();
        console.log('Register API response:', result);
        if (response.ok) {
          setAuth({ loggedIn: true, role: 'user', username });
        } else {
          setError(result.error || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('Registration failed');
      }
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f8fa' }}>
      <form onSubmit={handleRegister} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #2563eb22', minWidth: 320 }}>
        <h2 style={{ color: '#2563eb', marginBottom: 24, textAlign: 'center' }}>Register for Vaccina</h2>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Profession" value={profession} onChange={e => setProfession(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Contact" value={contact} onChange={e => setContact(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Disease" value={disease} onChange={e => setDisease(e.target.value)} style={inputStyle} />
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={buttonStyle}>Register</button>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span>Already have an account? </span>
          <a href="#" onClick={() => setAuth(auth => ({ ...auth, showRegister: false }))} style={{ color: '#2563eb', textDecoration: 'underline' }}>Login</a>
        </div>
      </form>
    </div>
  );
}
