
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppointmentsComponent from './AppointmentsComponent';
import LoginComponent from './LoginComponent';
import RegisterComponent from './RegisterComponent';

function HomeComponent() { return <h2>Home</h2>; }
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
  const [auth, setAuth] = useState({ loggedIn: false, role: null, username: '', showRegister: false });

  // If not logged in, show login or register
  if (!auth.loggedIn) {
    if (auth.showRegister) return <RegisterComponent setAuth={setAuth} />;
    return <LoginComponent setAuth={setAuth} showRegister={auth.showRegister} />;
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
