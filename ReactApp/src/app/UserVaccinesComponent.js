
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserVaccinesComponent() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [charges, setCharges] = useState(0);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: booking, 2: confirmation
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [hRes, vRes] = await Promise.all([
          fetch('/api/hospitals'),
          fetch('/api/vaccines')
        ]);
        const hData = await hRes.json();
        const vData = await vRes.json();
        setHospitals(Array.isArray(hData) ? hData : []);
        setVaccines(Array.isArray(vData) ? vData : []);
      } catch {
        setHospitals([]);
        setVaccines([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculate charges when hospital or vaccine changes
  useEffect(() => {
    const hospital = hospitals.find(h => h._id === selectedHospital);
    const vaccine = vaccines.find(v => v._id === selectedVaccine);
    let total = 0;
    if (hospital && hospital.charges) total += Number(hospital.charges);
    if (vaccine && vaccine.price) total += Number(vaccine.price);
    setCharges(total);
  }, [selectedHospital, selectedVaccine, hospitals, vaccines]);

  const handleConfirmBooking = e => {
    e.preventDefault();
    setMessage('');
    if (!selectedHospital || !selectedVaccine || !appointmentDate || !appointmentTime) {
      setMessage('Please select hospital, vaccine, date, and time slot.');
      return;
    }
    setStep(2); // Show pay button
  };

  const handlePay = async () => {
    setMessage('');
    try {
      // Get userId and userName from localStorage auth
      const auth = JSON.parse(localStorage.getItem('auth'));
      const userId = auth && auth._id ? auth._id : auth && auth.userId ? auth.userId : undefined;
      const userName = auth && auth.username ? auth.username : '';
      const payload = {
        userId,
        userName,
        hospitalId: selectedHospital,
        vaccineId: selectedVaccine,
        date: appointmentDate,
        time: appointmentTime
      };
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Redirect to appointments page with banner
        navigate('/userappointments', { state: { bookingSuccess: true } });
      } else {
        const err = await res.json();
        setMessage('Error: ' + (err.error || 'Failed to book appointment'));
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>Book Vaccination</h2>
      {loading ? <div>Loading...</div> : (
        <>
          {step === 1 && (
            <>
              {showBanner && (
                <div style={{ background: '#22c55e', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
                  Booking success! Your appointment has been booked.
                </div>
              )}
              <form onSubmit={handleConfirmBooking}>
                <label style={{ display: 'block', marginBottom: 8 }}>Select Hospital:</label>
                <select value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} required>
                  <option value="">-- Select Hospital --</option>
                  {hospitals.map(h => <option key={h._id} value={h._id}>{h.name} ({h.type})</option>)}
                </select>
                <label style={{ display: 'block', marginBottom: 8 }}>Select Vaccine:</label>
                <select value={selectedVaccine} onChange={e => setSelectedVaccine(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} required>
                  <option value="">-- Select Vaccine --</option>
                  {vaccines.map(v => <option key={v._id} value={v._id}>{v.name} ({v.type})</option>)}
                </select>
                <label style={{ display: 'block', marginBottom: 8 }}>Appointment Date:</label>
                <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} required />
                <label style={{ display: 'block', marginBottom: 8 }}>Time Slot:</label>
                <select value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} required>
                  <option value="">-- Select Time Slot --</option>
                  <option value="09:00">09:00 - 10:00</option>
                  <option value="10:00">10:00 - 11:00</option>
                  <option value="11:00">11:00 - 12:00</option>
                  <option value="13:00">13:00 - 14:00</option>
                  <option value="14:00">14:00 - 15:00</option>
                  <option value="15:00">15:00 - 16:00</option>
                </select>
                <div style={{ marginBottom: 16, fontWeight: 500, background: '#f6f8fa', borderRadius: 6, padding: 12 }}>
                  <div>Hospital Charge: <span style={{ color: '#2563eb' }}>
                    ${hospitals.find(h => h._id === selectedHospital)?.charges || 0}
                  </span></div>
                  <div>Vaccine Price: <span style={{ color: '#2563eb' }}>
                    ${vaccines.find(v => v._id === selectedVaccine)?.price || 0}
                  </span></div>
                  <div style={{ borderTop: '1px solid #ddd', margin: '8px 0' }}></div>
                  <div>Total Charges: <span style={{ color: '#2563eb', fontWeight: 700 }}>${charges}</span></div>
                </div>
                <button type="submit" style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Confirm Booking</button>
                {message && <div style={{ marginTop: 12, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>}
              </form>
            </>
          )}
          {step === 2 && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24, textAlign: 'center' }}>
              <h3>Pay</h3>
              <div style={{ margin: '16px 0', textAlign: 'left' }}>
                <b>Hospital:</b> {hospitals.find(h => h._id === selectedHospital)?.name}<br />
                <b>Vaccine:</b> {vaccines.find(v => v._id === selectedVaccine)?.name}<br />
                <b>Date:</b> {appointmentDate}<br />
                <b>Time Slot:</b> {appointmentTime}<br />
                <b>Charges:</b> ${charges}
              </div>
              <button onClick={handlePay} style={{ width: '100%', padding: 10, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginBottom: 8 }}>Pay</button>
              <button onClick={() => setStep(1)} style={{ width: '100%', padding: 10, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6 }}>Cancel</button>
              {message && <div style={{ marginTop: 12, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
