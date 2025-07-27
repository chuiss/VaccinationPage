import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

export default function AdminAppointmentsComponent() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch appointments for all users, optionally filtered by status
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = '/api/appointments';
        if (statusFilter) url += `?status=${encodeURIComponent(statusFilter)}`;
        const res = await fetch(url);
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setAppointments([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [statusFilter]);

  // PDF generation handler
  const handleGeneratePdf = (appointment) => {
    const doc = new jsPDF();
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
    addRow('Hospital Charge:', `$${appointment.hospitalId?.charges || 0}`);
    addRow('Vaccine Charge:', `$${appointment.vaccineId?.price || 0}`);
    addRow('Total Charged:', `$${Number(appointment.hospitalId?.charges || 0) + Number(appointment.vaccineId?.price || 0)}`);
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

  // Approve/Reject handlers
  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/appointments/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(apps => apps.map(app => app._id === id ? { ...app, status } : app));
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>All Appointments (Admin View)</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="statusFilter" style={{ marginRight: 8, fontWeight: 500 }}>Filter by Status:</label>
        <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 4, borderRadius: 4 }}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : appointments.length === 0 ? (
        <div>No appointments found.</div>
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
              <th style={{ padding: 8, border: '1px solid #eee' }}>Actions</th>
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
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {statusIcon(a.status)}{a.status || 'Scheduled'}
                  {String(a.status).toLowerCase() === 'pending' && (
                    <span style={{ marginLeft: 8, display: 'inline-flex', gap: 4 }}>
                      <button onClick={() => handleStatusChange(a._id, 'approved')} style={{ padding: '2px 8px', borderRadius: 4, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Approve</button>
                      <button onClick={() => handleStatusChange(a._id, 'rejected')} style={{ padding: '2px 8px', borderRadius: 4, border: 'none', background: '#e53e3e', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Reject</button>
                    </span>
                  )}
                </td>
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
            <div style={{ marginBottom: 8 }}><b>Patient:</b> {selectedAppointment.userName || ''}</div>
            <div style={{ marginBottom: 8 }}><b>Hospital:</b> {selectedAppointment.hospitalId?.name || selectedAppointment.hospitalName || selectedAppointment.hospital}</div>
            <div style={{ marginBottom: 8 }}><b>Address:</b> {selectedAppointment.hospitalId?.address || selectedAppointment.hospitalAddress || ''}</div>
            <div style={{ marginBottom: 8 }}><b>Vaccine:</b> {selectedAppointment.vaccineId?.name || selectedAppointment.vaccineName || selectedAppointment.vaccine}</div>
            <div style={{ marginBottom: 8 }}><b>Date:</b> {selectedAppointment.date ? new Date(selectedAppointment.date).toLocaleDateString() : ''}</div>
            <div style={{ marginBottom: 8 }}><b>Time Slot:</b> {selectedAppointment.time || ''}</div>
            <div style={{ marginBottom: 8 }}><b>Hospital Charge:</b> ${selectedAppointment.hospitalId?.charges || 0}</div>
            <div style={{ marginBottom: 8 }}><b>Vaccine Charge:</b> ${selectedAppointment.vaccineId?.price || 0}</div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}><b>Total Charged:</b> ${
              (Number(selectedAppointment.hospitalId?.charges || 0) + Number(selectedAppointment.vaccineId?.price || 0))
            }</div>
            <div style={{ marginBottom: 8 }}><b>Status:</b> {statusIcon(selectedAppointment.status)}{selectedAppointment.status || 'Scheduled'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
