import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function UserAppointmentsComponent() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const bookingSuccess = location.state && location.state.bookingSuccess;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Replace with actual user-specific API endpoint
        const res = await fetch('/api/appointments');
        const data = await res.json();
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
        } else {
          setAppointments([]);
        }
      } catch {
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
      {loading ? <div>Loading...</div> : appointments.length === 0 ? (
        <div>No appointments found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
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
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.hospitalId?.name || a.hospitalName || a.hospital}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.vaccineId?.name || a.vaccineName || a.vaccine}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.date ? new Date(a.date).toLocaleDateString() : ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{a.time || ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{statusIcon(a.status)}{a.status || 'Scheduled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
