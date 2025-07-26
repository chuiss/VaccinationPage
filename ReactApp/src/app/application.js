
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppointmentsComponent from './AppointmentsComponent';
import LoginComponent from './LoginComponent';
import RegisterComponent from './RegisterComponent';

function HomeComponent() { return <h2>Home</h2>; }
function DashboardComponent({ name }) { return <h2>Welcome, {name}!</h2>; }
function VaccinesComponent() { return <h2>Vaccines</h2>; }
function HospitalsComponent() { return <h2>Hospitals</h2>; }
function PatientsComponent() { return <h2>Patients</h2>; }
function ReportsComponent() { return <h2>Reports</h2>; }
function SettingsComponent() { return <h2>Settings</h2>; }
// Logout function to be used from Sidebar or any button
function useLogout(setAuth) {
  const navigate = useNavigate();
  return () => {
    setAuth({ loggedIn: false, role: null, username: '', name: '', showRegister: false });
    localStorage.removeItem('auth');
    navigate('/');
  };
}
function AdminComponent() { return <h2>Admin</h2>; }
function NotFoundComponent() { return <h2>404 Not Found</h2>; }


export default function ApplicationComponent() {
  // Simple auth state for demo
  // Persist auth state in localStorage
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : { loggedIn: false, role: null, username: '', name: '', showRegister: false };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);
function LogoutComponent() {
  useEffect(() => {
    setAuth({ loggedIn: false, role: null, username: '', name: '', showRegister: false });
    localStorage.removeItem('auth');
  }, []);
  return <h2>Logout</h2>;
}

  // If not logged in, show login or register
  if (!auth.loggedIn) {
    if (auth.showRegister) return <RegisterComponent setAuth={setAuth} />;
    return <LoginComponent setAuth={setAuth} showRegister={auth.showRegister} />;
  }

  // Role-based routing
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar setAuth={setAuth} />
        <div style={{ marginLeft: 220, width: '100%', background: '#f6f8fa', minHeight: '100vh', padding: 32 }}>
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/dashboard" element={<DashboardComponent name={auth.name} />} />
            <Route path="/appointments" element={<AppointmentsComponent />} />
            <Route path="/vaccines" element={<VaccinesComponent />} />
            <Route path="/hospitals" element={<HospitalsComponent />} />
            <Route path="/patients" element={<PatientsComponent />} />
            <Route path="/reports" element={<ReportsComponent />} />
            <Route path="/settings" element={<SettingsComponent />} />
            {auth.role === 'admin' && <Route path="/admin" element={<AdminComponent />} />}
            <Route path="*" element={<NotFoundComponent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
