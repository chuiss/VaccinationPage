import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
 
export default function UserAppointmentsComponent() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const bookingSuccess = location.state && location.state.bookingSuccess;

  // Helper function to get current user from auth
  const getCurrentUser = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth && auth.username ? auth.username : '';
    } catch {
      return '';
    }
  };

    // PDF generation handler
  const handleGeneratePdf = (appointment) => {
    const doc = new jsPDF();
    // Centered, bold title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Vaccination Appointment Summary';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 22);

    doc.setFontSize(12);
    let y = 38;
    const addRow = (label, value) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 18, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, y);
      y += 10;
    };
    addRow('Patient:', appointment.userName || '');
    addRow('Hospital:', appointment.hospitalId?.name || appointment.hospitalName || appointment.hospital || '');
    addRow('Address:', appointment.hospitalId?.address || appointment.hospitalAddress || '');
    addRow('Vaccine:', appointment.vaccineId?.name || appointment.vaccineName || appointment.vaccine || '');
    addRow('Date:', appointment.date ? new Date(appointment.date).toLocaleDateString() : '');
    addRow('Time Slot:', appointment.time || '');
    addRow('Hospital Charge:', `$${appointment.hospitalCharges || 0}`);
    addRow('Vaccine Charge:', `$${appointment.vaccinePrice || 0}`);
    addRow('Total Charged:', `$${Number(appointment.hospitalCharges || 0) + Number(appointment.vaccinePrice || 0)}`);
    addRow('Status:', (appointment.status || 'Scheduled').toUpperCase());

    doc.save(`appointment_${appointment._id}.pdf`);
  };

  // Delete appointment handler
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(appointments => appointments.filter(app => app._id !== id));
      } else {
        alert('Failed to delete appointment.');
      }
    } catch (err) {
      alert('Error deleting appointment: ' + err.message);
    }
  };
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get current user from auth in localStorage
        let currentUser = '';
        try {
          const auth = JSON.parse(localStorage.getItem('auth'));
          currentUser = auth && auth.username ? auth.username : '';
        } catch {
          currentUser = '';
        }

        if (!currentUser) {
          console.log('No current user found in auth');
          setAppointments([]);
          setLoading(false);
          return;
        }

        // Fetch appointments for the specific user
        const res = await fetch(`/api/appointments/user/${currentUser}`);
        const data = await res.json();
        console.log('Fetched appointments data for user:', currentUser, data);
        
        let appointmentsData = Array.isArray(data) ? data : [];
        if (Array.isArray(appointmentsData)) {
          // Sort by date (desc), then time (desc, string compare)
          appointmentsData.sort((a, b) => {
            // Compare date first
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            // If same date, compare time (descending)
            if ((b.time || '') > (a.time || '')) return 1;
            if ((b.time || '') < (a.time || '')) return -1;
            return 0;
          });
          setAppointments(appointmentsData);
          console.log('Appointments state set to:', appointmentsData);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.log('Error fetching appointments:', err);
        setAppointments([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Status icon mapping
  const statusIcon = status => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return <span title="Pending" style={{ color: '#f59e42', marginRight: 6 }}>⏳</span>;
      case 'approved':
        return <span title="Approved" style={{ color: '#22c55e', marginRight: 6 }}>✔️</span>;
      case 'denied':
        return <span title="Denied" style={{ color: '#e53e3e', marginRight: 6 }}>❌</span>;
      case 'rejected':
        return <span title="Rejected" style={{ color: '#e53e3e', marginRight: 6 }}>🚫</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      {bookingSuccess && (
        <div style={{ background: '#22c55e', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
          Booking success! Your appointment has been booked.
        </div>
      )}
      <h2>My Appointments</h2>
      {loading ? <div>Loading...</div> : (() => {
        let currentUser = '';
        try {
          const auth = JSON.parse(localStorage.getItem('auth'));
          currentUser = auth && auth.username ? auth.username : '';
        } catch {
          currentUser = '';
        }
        return !currentUser;
      })() ? (
        <div style={{ textAlign: 'center', padding: 24, background: '#fef3cd', border: '1px solid #fbbf24', borderRadius: 8 }}>
          <p style={{ margin: 0, color: '#92400e' }}>Please log in to view your appointments.</p>
        </div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <p style={{ margin: 0, color: '#6b7280' }}>No appointments found.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Patient</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Hospital</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Vaccine</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Date</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Time Slot</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.userName || ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.hospitalId?.name || a.hospitalName || a.hospital}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.vaccineId?.name || a.vaccineName || a.vaccine}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.date ? new Date(a.date).toLocaleDateString() : ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.time || ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{statusIcon(a.status)}{a.status || 'Scheduled'}</td>
                <td style={{ padding: 8, border: '1px solid #eee', display: 'flex', gap: 8 }}>
                  <button onClick={() => { setSelectedAppointment(a); setShowModal(true); }} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>View</button>
                  <button onClick={() => handleGeneratePdf(a)} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>PDF</button>
                  <button onClick={() => handleDeleteAppointment(a._id)} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#e53e3e', color: '#fff', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for viewing appointment details */}
      {showModal && selectedAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 16px #0003', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
            <h3 style={{ marginBottom: 16 }}>Appointment Details</h3>
            <div style={{ marginBottom: 8 }}><b>Hospital:</b> {selectedAppointment.hospitalId?.name || selectedAppointment.hospitalName || selectedAppointment.hospital}</div>
            <div style={{ marginBottom: 8 }}><b>Address:</b> {selectedAppointment.hospitalId?.address || selectedAppointment.hospitalAddress || ''}</div>
            <div style={{ marginBottom: 8 }}><b>Vaccine:</b> {selectedAppointment.vaccineId?.name || selectedAppointment.vaccineName || selectedAppointment.vaccine}</div>
            <div style={{ marginBottom: 8 }}><b>Date:</b> {selectedAppointment.date ? new Date(selectedAppointment.date).toLocaleDateString() : ''}</div>
            <div style={{ marginBottom: 8 }}><b>Time Slot:</b> {selectedAppointment.time || ''}</div>
            <div style={{ marginBottom: 8 }}><b>Hospital Charge:</b> ${selectedAppointment.hospitalCharges || selectedAppointment.hospitalId?.charges || 0}</div>
            <div style={{ marginBottom: 8 }}><b>Vaccine Charge:</b> ${selectedAppointment.vaccinePrice || selectedAppointment.vaccineId?.price || 0}</div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}><b>Total Charged:</b> ${
              (Number(selectedAppointment.hospitalCharges || selectedAppointment.hospitalId?.charges || 0) + Number(selectedAppointment.vaccinePrice || selectedAppointment.vaccineId?.price || 0))
            }</div>
            <div style={{ marginBottom: 8 }}><b>Status:</b> {statusIcon(selectedAppointment.status)}{selectedAppointment.status || 'Scheduled'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
