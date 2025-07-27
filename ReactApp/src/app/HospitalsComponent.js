import React, { useState, useEffect } from 'react';
import HospitalForm from './HospitalForm';

export default function HospitalsComponent() {
  const [hospitals, setHospitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      setHospitals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    try {
      await fetch(`/api/hospitals/${id}`, { method: 'DELETE' });
      fetchHospitals();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Hospitals</h2>
        <button onClick={() => setShowForm(f => !f)} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {showForm ? 'Close' : 'Add Hospital'}
        </button>
      </div>
      {showForm && <HospitalForm onHospitalCreated={() => { fetchHospitals(); setShowForm(false); }} />}
      <hr style={{ margin: '24px 0' }} />
      {loading ? (
        <div>Loading hospitals...</div>
      ) : hospitals.length === 0 ? (
        <div>No hospitals found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Address</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Type</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Charges</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(h => (
              <tr key={h._id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{h.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{h.address}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{h.type}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{h.charges}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <button onClick={() => handleDelete(h._id)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
