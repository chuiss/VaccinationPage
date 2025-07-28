import React from 'react';
import VaccinationWatchList from './VaccinationWatchList';

export default function HomeComponent() {
  // Get username from localStorage auth
  let username = '';
  let role = '';
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    username = auth && (auth.name || auth.username) ? (auth.name || auth.username) : '';
    role = auth && auth.role ? auth.role : '';
  } catch {}
  
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 20,
        padding: 48,
        color: 'white',
        marginBottom: 32,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 40px 40px'
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 42, 
            fontWeight: '800',
            marginBottom: 16,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {username ? `Welcome back, ${username}! 🎉` : 'Welcome to VaccineCare 💉'}
          </h1>
          <p style={{ 
            fontSize: 18, 
            margin: 0,
            opacity: 0.95,
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {role === 'admin' 
              ? 'Manage and monitor vaccination programs with comprehensive analytics and reporting tools.'
              : 'Your trusted platform for vaccination scheduling and health management.'
            }
          </p>
        </div>
      </div>

      {/* Vaccination WatchList */}
      <VaccinationWatchList 
        autoRotate={true}
        rotationInterval={4500}
        showQuickStats={true}
        height={180}
        style={{ marginBottom: 32 }}
      />

      {/* Feature Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {role === 'admin' ? [
          {
            icon: '📊',
            title: 'Real-time Analytics',
            description: 'Monitor vaccination progress with live data and comprehensive reporting dashboards.',
            color: '#2563eb'
          },
          {
            icon: '🏥',
            title: 'Hospital Management',
            description: 'Coordinate with healthcare facilities and track performance across the network.',
            color: '#059669'
          },
          {
            icon: '📅',
            title: 'Appointment Control',
            description: 'Approve and manage vaccination appointments with intelligent scheduling.',
            color: '#dc2626'
          }
        ] : [
          {
            icon: '💉',
            title: 'Easy Scheduling',
            description: 'Book vaccination appointments at your preferred time and location.',
            color: '#2563eb'
          },
          {
            icon: '📱',
            title: 'Track Progress',
            description: 'Monitor your vaccination status and upcoming appointments.',
            color: '#059669'
          },
          {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'Your health data is protected with enterprise-grade security.',
            color: '#7c3aed'
          }
        ].map((feature, index) => (
          <div key={index} style={{
            background: 'white',
            padding: 28,
            borderRadius: 16,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
          }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `${feature.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              marginBottom: 20
            }}>
              {feature.icon}
            </div>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: 12
            }}>
              {feature.title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: 15,
              color: '#6B7280',
              lineHeight: 1.6
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div style={{
        background: 'white',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: 24
        }}>
          Platform Impact
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 24
        }}>
          {[
            { number: '10K+', label: 'Vaccinations', icon: '💉' },
            { number: '50+', label: 'Hospitals', icon: '🏥' },
            { number: '99.9%', label: 'Uptime', icon: '⚡' },
            { number: '24/7', label: 'Support', icon: '🛟' }
          ].map((stat, index) => (
            <div key={index}>
              <div style={{
                fontSize: 32,
                marginBottom: 8
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: '800',
                color: '#2563eb',
                marginBottom: 4
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: 14,
                color: '#6B7280',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
