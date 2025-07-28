import React, { useState, useEffect } from 'react';

export default function WatchListComponent() {
  const [watchListData, setWatchListData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchListData();
    
    // Auto-rotate every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % watchListData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [watchListData.length]);

  const fetchWatchListData = async () => {
    setLoading(true);
    try {
      const [
        ageRes,
        genderRes,
        populationRes,
        vaccineRes,
        hospitalRes,
        dailyRes
      ] = await Promise.all([
        fetch('/api/reports/demographics/age'),
        fetch('/api/reports/demographics/gender'),
        fetch('/api/reports/population-coverage'),
        fetch('/api/reports/vaccine-distribution'),
        fetch('/api/reports/hospital-performance'),
        fetch('/api/reports/daily-doses')
      ]);

      const [
        ageGroups,
        genderGroups,
        populationCoverage,
        vaccineDistribution,
        hospitalPerformance,
        dailyDoses
      ] = await Promise.all([
        ageRes.json(),
        genderRes.json(),
        populationRes.json(),
        vaccineRes.json(),
        hospitalRes.json(),
        dailyRes.json()
      ]);

      // Calculate key statistics
      const totalVaccinated = populationCoverage.actuallyVaccinated || 0;
      const totalScheduled = populationCoverage.scheduledForVaccination || 0;
      const coveragePercentage = populationCoverage.vaccinatedPercentage || 0;
      
      // Top age group
      const topAgeGroup = Object.entries(ageGroups).reduce((max, [age, count]) => 
        count > max.count ? { age, count } : max, { age: 'N/A', count: 0 });
      
      // Top gender
      const topGender = Object.entries(genderGroups).reduce((max, [gender, count]) => 
        count > max.count ? { gender, count } : max, { gender: 'N/A', count: 0 });
      
      // Top vaccine
      const topVaccine = Object.entries(vaccineDistribution).reduce((max, [vaccine, count]) => 
        count > max.count ? { vaccine: vaccine.substring(0, 20) + (vaccine.length > 20 ? '...' : ''), count } : max, { vaccine: 'N/A', count: 0 });
      
      // Top hospital
      const topHospital = Object.entries(hospitalPerformance).reduce((max, [hospital, count]) => 
        count > max.count ? { hospital: hospital.substring(0, 20) + (hospital.length > 20 ? '...' : ''), count } : max, { hospital: 'N/A', count: 0 });
      
      // Total daily doses
      const totalDoses = dailyDoses.reduce((sum, d) => sum + d.doses, 0);
      const avgDailyDoses = dailyDoses.length > 0 ? Math.round(totalDoses / dailyDoses.length) : 0;

      const watchListItems = [
        {
          id: 1,
          title: "Overall Coverage",
          icon: "🎯",
          primaryValue: `${coveragePercentage}%`,
          secondaryValue: `${totalVaccinated} vaccinated`,
          description: `${totalScheduled} scheduled • ${populationCoverage.totalPopulation || 0} total patients`,
          color: "#2563eb",
          bgGradient: "linear-gradient(135deg, #2563eb, #3b82f6)"
        },
        {
          id: 2,
          title: "Top Age Group",
          icon: "👥",
          primaryValue: topAgeGroup.age,
          secondaryValue: `${topAgeGroup.count} people`,
          description: "Most vaccinated age demographic",
          color: "#059669",
          bgGradient: "linear-gradient(135deg, #059669, #10b981)"
        },
        {
          id: 3,
          title: "Gender Distribution",
          icon: "⚥",
          primaryValue: topGender.gender,
          secondaryValue: `${topGender.count} people`,
          description: "Leading gender in vaccinations",
          color: "#dc2626",
          bgGradient: "linear-gradient(135deg, #dc2626, #ef4444)"
        },
        {
          id: 4,
          title: "Popular Vaccine",
          icon: "💉",
          primaryValue: topVaccine.vaccine,
          secondaryValue: `${topVaccine.count} users`,
          description: "Most administered vaccine",
          color: "#7c3aed",
          bgGradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)"
        },
        {
          id: 5,
          title: "Top Hospital",
          icon: "🏥",
          primaryValue: topHospital.hospital,
          secondaryValue: `${topHospital.count} patients`,
          description: "Best performing healthcare facility",
          color: "#ea580c",
          bgGradient: "linear-gradient(135deg, #ea580c, #f97316)"
        },
        {
          id: 6,
          title: "Daily Doses",
          icon: "📊",
          primaryValue: avgDailyDoses.toString(),
          secondaryValue: "avg/day",
          description: `${totalDoses} total doses administered`,
          color: "#0891b2",
          bgGradient: "linear-gradient(135deg, #0891b2, #06b6d4)"
        }
      ];

      setWatchListData(watchListItems);
    } catch (error) {
      console.error('Error fetching watch list data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        height: 200,
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0 24px 0',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          color: '#64748b',
          fontSize: 16,
          fontWeight: 500
        }}>
          <div style={{
            width: 24,
            height: 24,
            border: '3px solid #cbd5e1',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading vaccination insights...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (watchListData.length === 0) {
    return null;
  }

  const currentItem = watchListData[currentIndex];

  return (
    <div style={{ margin: '0 0 32px 0' }}>
      {/* Main WatchList Banner */}
      <div style={{
        height: 180,
        background: currentItem.bgGradient,
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.8s ease-in-out',
        marginBottom: 16
      }}>
        {/* Animated background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 60% 80%, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 80px 80px, 120px 120px, 90px 90px',
          animation: 'float 6s ease-in-out infinite'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '32px 40px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 12
            }}>
              <span style={{ 
                fontSize: 32,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}>
                {currentItem.icon}
              </span>
              <h3 style={{
                margin: 0,
                fontSize: 24,
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {currentItem.title}
              </h3>
            </div>
            
            <div style={{
              fontSize: 48,
              fontWeight: '900',
              lineHeight: 1,
              marginBottom: 8,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}>
              {currentItem.primaryValue}
            </div>
            
            <div style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 4,
              opacity: 0.9
            }}>
              {currentItem.secondaryValue}
            </div>
            
            <div style={{
              fontSize: 14,
              opacity: 0.8,
              fontWeight: '500'
            }}>
              {currentItem.description}
            </div>
          </div>

          {/* Progress indicators */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'center'
          }}>
            {watchListData.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: index === currentIndex ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {watchListData.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setCurrentIndex(index)}
            style={{
              minWidth: 180,
              padding: '16px 20px',
              background: index === currentIndex ? 'white' : '#f8fafc',
              border: index === currentIndex ? `2px solid ${item.color}` : '1px solid #e2e8f0',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: index === currentIndex ? 'translateY(-2px)' : 'none',
              boxShadow: index === currentIndex ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{
                fontSize: 12,
                fontWeight: '600',
                color: index === currentIndex ? item.color : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {item.title}
              </span>
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: '700',
              color: index === currentIndex ? item.color : '#1e293b',
              marginBottom: 4
            }}>
              {item.primaryValue}
            </div>
            <div style={{
              fontSize: 12,
              color: '#64748b',
              fontWeight: '500'
            }}>
              {item.secondaryValue}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -10px) rotate(1deg); }
          66% { transform: translate(-5px, 5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
