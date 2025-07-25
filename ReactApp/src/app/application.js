import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppointmentsComponent from './AppointmentsComponent';

function HomeComponent() { return <h2>Home</h2>; }
function LoginComponent() { return <h2>Login</h2>; }
function RegisterComponent() { return <h2>Register</h2>; }
function DashboardComponent() { return <h2>Dashboard</h2>; }
function VaccinesComponent() { return <h2>Vaccines</h2>; }
function HospitalsComponent() { return <h2>Hospitals</h2>; }
function PatientsComponent() { return <h2>Patients</h2>; }
function ReportsComponent() { return <h2>Reports</h2>; }
function SettingsComponent() { return <h2>Settings</h2>; }
function LogoutComponent() { return <h2>Logout</h2>; }
function AdminComponent() { return <h2>Admin</h2>; }
function NotFoundComponent() { return <h2>404 Not Found</h2>; }

export default function ApplicationComponent() {
  // Simple auth state for demo
  const [auth, setAuth] = useState({ loggedIn: false, role: null, username: '' });

  // Styled login page
  function LoginComponent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = async e => {
      e.preventDefault();
      if (username && password) {
        try {
          // Fetch user from backend to determine role
          const res = await fetch('/api/users');
          const users = await res.json();
          const user = users.find(u => u.name === username);
          if (user && user.profession === 'admin') {
            setAuth({ loggedIn: true, role: 'admin', username });
          } else if (user) {
            setAuth({ loggedIn: true, role: 'user', username });
          } else {
            setError('User not found');
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
            <a href="#" onClick={() => setAuth({ ...auth, showRegister: true })} style={{ color: '#2563eb', textDecoration: 'underline' }}>Register</a>
          </div>
        </form>
      </div>
    );
  }

  // Styled register page
  function RegisterComponent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [profession, setProfession] = useState('');
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [disease, setDisease] = useState('');
    const [error, setError] = useState('');
    const handleRegister = async e => {
      e.preventDefault();
      if (username && password) {
        try {
          // Only include medicalCertificate if admin
          const userData = {
            name: username,
            age: age ? Number(age) : undefined,
          profession: profession,
            contact,
            address,
            gender,
            disease
          };
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          setAuth({ loggedIn: true, role: role === 'admin' ? 'admin' : 'user', username });
        } catch (err) {
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
          {/* Registration is only for patients, no role selection */}
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
            <a href="#" onClick={() => setAuth({ ...auth, showRegister: false })} style={{ color: '#2563eb', textDecoration: 'underline' }}>Login</a>
          </div>
        </form>
      </div>
    );
  }

  // Input/button styles
  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 };
  const buttonStyle = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' };

  // If not logged in, show login or register
  if (!auth.loggedIn) {
    if (auth.showRegister) return <RegisterComponent />;
    return <LoginComponent />;
  }

  // Role-based routing
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 220, width: '100%', background: '#f6f8fa', minHeight: '100vh', padding: 32 }}>
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/dashboard" element={<DashboardComponent />} />
            <Route path="/appointments" element={<AppointmentsComponent />} />
            <Route path="/vaccines" element={<VaccinesComponent />} />
            <Route path="/hospitals" element={<HospitalsComponent />} />
            <Route path="/patients" element={<PatientsComponent />} />
            <Route path="/reports" element={<ReportsComponent />} />
            <Route path="/settings" element={<SettingsComponent />} />
            <Route path="/logout" element={<LogoutComponent />} />
            {auth.role === 'admin' && <Route path="/admin" element={<AdminComponent />} />}
            <Route path="*" element={<NotFoundComponent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
