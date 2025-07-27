import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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




const Sidebar = ({ setAuth, role: propRole }) => {
  const navigate = useNavigate();
  // Prefer role from props (live state), fallback to localStorage
  let role = propRole;
  if (!role) {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      role = auth && auth.role;
    } catch {}
  }

  const handleLogout = () => {
    setAuth({ loggedIn: false, role: null, username: '', name: '', showRegister: false });
    localStorage.removeItem('auth');
    navigate('/');
  };

  return (
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
        {role === 'admin' ? (
          <>
            <Link to="/dashboard" style={navStyle}><FaTachometerAlt /> Dashboard</Link>
            <Link to="/vaccines" style={navStyle}><FaSyringe /> Vaccines</Link>
            <Link to="/hospitals" style={navStyle}><FaHospital /> Hospitals</Link>
            <Link to="/appointments" style={navStyle}><FaCalendarAlt /> Appointments</Link>
            <Link to="/reports" style={navStyle}><FaChartPie /> Reports</Link>
            <Link to="/settings" style={navStyle}><FaCog /> Settings</Link>
          </>
        ) : (
          <>
            <Link to="/booking" style={navStyle}><FaSyringe /> Booking</Link>
            <Link to="/userappointments" style={navStyle}><FaCalendarAlt /> Appointments</Link>
          </>
        )}
        <button onClick={handleLogout} style={{ ...navStyle, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}><FaSignOutAlt /> Logout</button>
      </nav>
    </div>
  );
};

export default Sidebar;
