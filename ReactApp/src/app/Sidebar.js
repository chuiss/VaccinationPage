import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaSyringe, FaHospital, FaUserFriends, FaCalendarAlt, FaChartPie, FaCog, FaSignOutAlt } from 'react-icons/fa';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 24px',
  color: '#fff',
  textDecoration: 'none',
  fontSize: 16,
  fontWeight: 500,
  borderRadius: 8,
  marginBottom: 8,
  transition: 'background 0.2s',
};

const Sidebar = () => (
  <div style={{
    width: 220,
    background: '#2563eb',
    color: '#fff',
    minHeight: '100vh',
    paddingTop: 32,
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif'
  }}>
    <h2 style={{ marginLeft: 24, marginBottom: 32, fontWeight: 700 }}>Vaccina</h2>
    <nav>
      <Link to="/dashboard" style={navStyle}><FaTachometerAlt /> Dashboard</Link>
      <Link to="/vaccines" style={navStyle}><FaSyringe /> Vaccines</Link>
      <Link to="/hospitals" style={navStyle}><FaHospital /> Hospitals</Link>
      <Link to="/patients" style={navStyle}><FaUserFriends /> Patients</Link>
      <Link to="/appointments" style={navStyle}><FaCalendarAlt /> Appointments</Link>
      <Link to="/reports" style={navStyle}><FaChartPie /> Reports</Link>
      <Link to="/settings" style={navStyle}><FaCog /> Settings</Link>
      <Link to="/logout" style={navStyle}><FaSignOutAlt /> Logout</Link>
    </nav>
  </div>
);

export default Sidebar;
