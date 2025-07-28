import React, { useState, useEffect } from 'react';

export default function VaccinationWatchList({ 
  autoRotate = true, 
  rotationInterval = 4000,
  showQuickStats = true,
  height = 180,
  style = {}
}) {
  const [watchListData, setWatchListData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchWatchListData();
  }, []);

  useEffect(() => {
    if (!autoRotate || isPaused || watchListData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % watchListData.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, isPaused, watchListData.length]);

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

      // Process data to create watch list items
      const processedData = createWatchListItems({
        ageGroups,
        genderGroups,
        populationCoverage,
        vaccineDistribution,
        hospitalPerformance,
        dailyDoses
      });

      setWatchListData(processedData);
    } catch (error) {
      console.error('Error fetching watch list data:', error);
      // Create fallback data
      setWatchListData(createFallbackData());
    }
    setLoading(false);
  };

  const createWatchListItems = (data) => {
    const { ageGroups, genderGroups, populationCoverage, vaccineDistribution, hospitalPerformance, dailyDoses } = data;
    
    // Calculate statistics
    const totalVaccinated = populationCoverage.actuallyVaccinated || 0;
    const totalScheduled = populationCoverage.scheduledForVaccination || 0;
    const coveragePercentage = populationCoverage.vaccinatedPercentage || 0;
    
    const topAgeGroup = Object.entries(ageGroups || {}).reduce((max, [age, count]) => 
      count > max.count ? { age, count } : max, { age: 'N/A', count: 0 });
    
    const topGender = Object.entries(genderGroups || {}).reduce((max, [gender, count]) => 
      count > max.count ? { gender, count } : max, { gender: 'N/A', count: 0 });
    
    const topVaccine = Object.entries(vaccineDistribution || {}).reduce((max, [vaccine, count]) => 
      count > max.count ? { 
        vaccine: vaccine.length > 15 ? vaccine.substring(0, 15) + '...' : vaccine, 
        count 
      } : max, { vaccine: 'N/A', count: 0 });
    
    const topHospital = Object.entries(hospitalPerformance || {}).reduce((max, [hospital, count]) => 
      count > max.count ? { 
        hospital: hospital.length > 15 ? hospital.substring(0, 15) + '...' : hospital, 
        count 
      } : max, { hospital: 'N/A', count: 0 });
    
    const totalDoses = (dailyDoses || []).reduce((sum, d) => sum + d.doses, 0);
    const avgDailyDoses = dailyDoses && dailyDoses.length > 0 ? Math.round(totalDoses / dailyDoses.length) : 0;

    return [
      {
        id: 'coverage',
        title: "Vaccination Coverage",
        icon: "🎯",
        primaryValue: `${coveragePercentage}%`,
        secondaryValue: `${totalVaccinated} completed`,
        description: `${totalScheduled} scheduled • ${populationCoverage.totalPopulation || 0} total`,
        color: "#2563eb",
        bgGradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
        trend: coveragePercentage > 50 ? "up" : coveragePercentage > 25 ? "stable" : "down"
      },
      {
        id: 'demographics',
        title: "Top Demographics",
        icon: "👥",
        primaryValue: `${topAgeGroup.age} • ${topGender.gender}`,
        secondaryValue: `${topAgeGroup.count} • ${topGender.count}`,
        description: "Leading age group and gender",
        color: "#059669",
        bgGradient: "linear-gradient(135deg, #059669, #10b981)",
        trend: "stable"
      },
      {
        id: 'vaccine',
        title: "Popular Vaccine",
        icon: "💉",
        primaryValue: topVaccine.vaccine,
        secondaryValue: `${topVaccine.count} patients`,
        description: "Most administered vaccine type",
        color: "#7c3aed",
        bgGradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
        trend: topVaccine.count > 10 ? "up" : "stable"
      },
      {
        id: 'hospital',
        title: "Top Hospital",
        icon: "🏥",
        primaryValue: topHospital.hospital,
        secondaryValue: `${topHospital.count} patients`,
        description: "Best performing facility",
        color: "#ea580c",
        bgGradient: "linear-gradient(135deg, #ea580c, #f97316)",
        trend: topHospital.count > 5 ? "up" : "stable"
      },
      {
        id: 'activity',
        title: "Daily Activity",
        icon: "📈",
        primaryValue: avgDailyDoses.toString(),
        secondaryValue: "avg doses/day",
        description: `${totalDoses} total administered`,
        color: "#0891b2",
        bgGradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
        trend: avgDailyDoses > 5 ? "up" : "stable"
      }
    ];
  };

  const createFallbackData = () => [
    {
      id: 'loading',
      title: "System Status",
      icon: "⚡",
      primaryValue: "Ready",
      secondaryValue: "All systems operational",
      description: "Vaccination tracking system online",
      color: "#2563eb",
      bgGradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
      trend: "stable"
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div style={{
        height,
        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0 24px 0',
        border: '1px solid #e2e8f0',
        ...style
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
            width: 20,
            height: 20,
            border: '2px solid #cbd5e1',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading vaccination data...
        </div>
      </div>
    );
  }

  if (watchListData.length === 0) return null;

  const currentItem = watchListData[currentIndex];

  return (
    <div style={{ margin: '0 0 24px 0', ...style }}>
      {/* Main Banner */}
      <div 
        style={{
          height,
          background: currentItem.bgGradient,
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: autoRotate ? 'pointer' : 'default'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => autoRotate && setCurrentIndex((currentIndex + 1) % watchListData.length)}
      >
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 30px 30px',
          animation: isPaused ? 'none' : 'backgroundFloat 8s ease-in-out infinite'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '24px 32px',
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
              gap: 12,
              marginBottom: 8
            }}>
              <span style={{ 
                fontSize: 24,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}>
                {currentItem.icon}
              </span>
              <h3 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                opacity: 0.95
              }}>
                {currentItem.title}
              </h3>
              <span style={{ fontSize: 14, opacity: 0.8 }}>
                {getTrendIcon(currentItem.trend)}
              </span>
            </div>
            
            <div style={{
              fontSize: 32,
              fontWeight: '800',
              lineHeight: 1,
              marginBottom: 6,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.01em'
            }}>
              {currentItem.primaryValue}
            </div>
            
            <div style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 2,
              opacity: 0.9
            }}>
              {currentItem.secondaryValue}
            </div>
            
            <div style={{
              fontSize: 12,
              opacity: 0.8,
              fontWeight: '500'
            }}>
              {currentItem.description}
            </div>
          </div>

          {/* Navigation dots */}
          {watchListData.length > 1 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'center'
            }}>
              {watchListData.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: index === currentIndex ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {autoRotate && !isPaused && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            background: 'rgba(255,255,255,0.3)',
            animation: `progress ${rotationInterval}ms linear`,
            borderRadius: '0 0 16px 16px'
          }} />
        )}
      </div>

      {/* Quick Stats */}
      {showQuickStats && watchListData.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          overflowX: 'auto',
          paddingBottom: 4
        }}>
          {watchListData.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                minWidth: 120,
                padding: '12px 16px',
                background: index === currentIndex ? 'white' : '#f8fafc',
                border: index === currentIndex ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: index === currentIndex ? 'translateY(-1px)' : 'none',
                boxShadow: index === currentIndex ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4
              }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: index === currentIndex ? item.color : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {item.title.split(' ')[0]}
                </span>
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: '700',
                color: index === currentIndex ? item.color : '#1e293b',
                marginBottom: 2
              }}>
                {item.primaryValue.length > 12 ? item.primaryValue.substring(0, 12) + '...' : item.primaryValue}
              </div>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes backgroundFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(5px, -5px); }
          50% { transform: translate(-3px, 3px); }
          75% { transform: translate(3px, -2px); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
