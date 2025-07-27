import React from 'react';

export default function HomeComponent() {
  // Get username from localStorage auth
  let username = '';
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    username = auth && (auth.name || auth.username) ? (auth.name || auth.username) : '';
  } catch {}
  
  return (
    <div style={{ padding: 32 }}>
      <h2>
        {username ? `Welcome ${username}` : 'Welcome'}
      </h2>
      {/* ...existing home page content... */}
    </div>
  );
}
