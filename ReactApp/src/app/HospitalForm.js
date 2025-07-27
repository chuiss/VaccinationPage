import React, { useState } from 'react';

export default function HospitalForm({ onHospitalCreated }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    type: '',
    charges: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMessage('Hospital created successfully!');
        setForm({ name: '', address: '', type: '', charges: '' });
        if (onHospitalCreated) onHospitalCreated();
      } else {
        const err = await res.json();
        setMessage('Error: ' + (err.error || 'Failed to create hospital'));
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>Register New Hospital</h2>
      <input name="name" placeholder="Hospital Name" value={form.name} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="type" placeholder="Type" value={form.type} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="charges" placeholder="Charges" type="number" value={form.charges} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <button type="submit" style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Create Hospital</button>
      {message && <div style={{ marginTop: 12, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>}
    </form>
  );
}
