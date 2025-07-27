import React, { useState, useEffect } from 'react';
import VaccineForm from './VaccineForm';

export default function VaccinesComponent() {
  const [vaccines, setVaccines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vaccines');
      const data = await res.json();
      setVaccines(Array.isArray(data) ? data : []);
    } catch (err) {
      setVaccines([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vaccine?')) return;
    try {
      await fetch(`/api/vaccines/${id}`, { method: 'DELETE' });
      fetchVaccines();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Vaccines</h2>
        <button onClick={() => setShowForm(f => !f)} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {showForm ? 'Close' : 'Add Vaccine'}
        </button>
      </div>
      {showForm && <VaccineForm onVaccineCreated={() => { fetchVaccines(); setShowForm(false); }} />}
      <hr style={{ margin: '24px 0' }} />
      {loading ? (
        <div>Loading vaccines...</div>
      ) : vaccines.length === 0 ? (
        <div>No vaccines found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Type</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Price</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Origin</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Doses Required</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Description</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map(v => (
              <tr key={v._id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.type}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.price}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.origin}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.dosesRequired}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{v.description}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <button onClick={() => handleDelete(v._id)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
