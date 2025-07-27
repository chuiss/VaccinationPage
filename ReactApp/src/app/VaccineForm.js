import React, { useState } from 'react';

export default function VaccineForm({ onVaccineCreated }) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    price: '',
    origin: '',
    dosesRequired: '',
    description: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/vaccines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMessage('Vaccine created successfully!');
        setForm({
          name: '',
          type: '',
          price: '',
          origin: '',
          dosesRequired: '',
          description: ''
        });
        if (onVaccineCreated) onVaccineCreated();
      } else {
        const err = await res.json();
        setMessage('Error: ' + (err.error || 'Failed to create vaccine'));
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>Register New Vaccine</h2>
      <input name="name" placeholder="Vaccine Name" value={form.name} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="type" placeholder="Type" value={form.type} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="origin" placeholder="Origin" value={form.origin} onChange={handleChange} style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input name="dosesRequired" placeholder="Doses Required" type="number" value={form.dosesRequired} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <button type="submit" style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Create Vaccine</button>
      {message && <div style={{ marginTop: 12, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>}
    </form>
  );
}
