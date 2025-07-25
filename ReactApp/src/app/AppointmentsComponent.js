import React, { useEffect, useState } from 'react';

function AppointmentsComponent() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div>
      <h2>Appointments</h2>
      <ul>
        {appointments.map(app => (
          <li key={app._id}>
            {app.title} - {app.date} - {app.status === 'rejected' ? 'Rejected (Past Date)' : app.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppointmentsComponent;
