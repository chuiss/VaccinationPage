import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import VaccinationWatchList from './VaccinationWatchList';

export default function ReportsComponent() {
  const [reports, setReports] = useState({
    ageGroups: {},
    genderGroups: {},
    diseaseGroups: {},
    professionGroups: {},
    dailyDoses: [],
    populationCoverage: {},
    vaccineDistribution: {},
    hospitalPerformance: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demographics');

  // D3 chart refs
  const ageChartRef = useRef();
  const genderChartRef = useRef();
  const diseaseChartRef = useRef();
  const professionChartRef = useRef();
  const dailyDosesChartRef = useRef();
  const populationChartRef = useRef();
  const vaccineChartRef = useRef();
  const hospitalChartRef = useRef();

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [
        ageRes,
        genderRes,
        diseaseRes,
        professionRes,
        dailyRes,
        populationRes,
        vaccineRes,
        hospitalRes
      ] = await Promise.all([
        fetch('/api/reports/demographics/age'),
        fetch('/api/reports/demographics/gender'),
        fetch('/api/reports/demographics/preexisting'),
        fetch('/api/reports/demographics/profession'),
        fetch('/api/reports/daily-doses'),
        fetch('/api/reports/population-coverage'),
        fetch('/api/reports/vaccine-distribution'),
        fetch('/api/reports/hospital-performance')
      ]);

      const [
        ageGroups,
        genderGroups,
        diseaseGroups,
        professionGroups,
        dailyDoses,
        populationCoverage,
        vaccineDistribution,
        hospitalPerformance
      ] = await Promise.all([
        ageRes.json(),
        genderRes.json(),
        diseaseRes.json(),
        professionRes.json(),
        dailyRes.json(),
        populationRes.json(),
        vaccineRes.json(),
        hospitalRes.json()
      ]);

      setReports({
        ageGroups,
        genderGroups,
        diseaseGroups,
        professionGroups,
        dailyDoses,
        populationCoverage,
        vaccineDistribution,
        hospitalPerformance
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  // D3 Vertical Bar Chart
  const createBarChart = (ref, data, title, color = '#2563eb') => {
    if (!ref.current || !data) return;

    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 60, right: 40, bottom: 100, left: 80 };
    const width = 520 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#ffffff")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "8px")
      .style("box-shadow", "0 1px 3px rgba(0, 0, 0, 0.1)");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dataArray = Object.entries(data).map(([key, value]) => ({ key, value }));

    // Vertical bar chart scales (swapped x and y from previous version)
    const x = d3.scaleBand()
      .domain(dataArray.map(d => d.key))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataArray, d => d.value)])
      .range([height, 0]);

    // Create vertical bars
    g.selectAll(".bar")
      .data(dataArray)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", color)
      .attr("rx", 4)
      .style("opacity", 0.8);

    // X-axis with rotated labels
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#374151");

    // Value labels on top of bars
    g.selectAll(".label")
      .data(dataArray)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => x(d.key) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .style("fill", "#374151")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(d => d.value);

    // X-axis label
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", height + margin.top + margin.bottom - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Category");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 25)
      .attr("x", -(height + margin.top) / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Number of Vaccinations");

    // Title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .style("fill", "#1F2937")
      .text(title);
  };

  // D3 Pie Chart
  const createPieChart = (ref, data, title) => {
    if (!ref.current || !data) return;

    d3.select(ref.current).selectAll("*").remove();

    const width = 480;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 60;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#ffffff")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "8px")
      .style("box-shadow", "0 1px 3px rgba(0, 0, 0, 0.1)");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal([
      '#2563eb', '#7c3aed', '#059669', '#dc2626', '#ea580c', 
      '#ca8a04', '#7c2d12', '#be185d', '#0891b2', '#4338ca'
    ]);

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const dataArray = Object.entries(data).map(([key, value]) => ({ key, value }));

    const arcs = g.selectAll(".arc")
      .data(pie(dataArray))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .style("opacity", 0.8)
      .style("stroke", "#ffffff")
      .style("stroke-width", 2);

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#ffffff")
      .text(d => d.data.value > 0 ? d.data.value : '');

    // Legend
    const legend = svg.selectAll(".legend")
      .data(dataArray)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(20, ${40 + i * 25})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("rx", 3)
      .style("fill", (d, i) => color(i));

    legend.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "14px")
      .style("fill", "#374151")
      .style("font-weight", "600")
      .text(d => `${d.key}: ${d.value}`);

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .style("fill", "#1F2937")
      .text(title);
  };

  // Line Chart for Daily Doses
  const createLineChart = (ref, data, title) => {
    if (!ref.current || !data || data.length === 0) return;

    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#ffffff")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "8px")
      .style("box-shadow", "0 1px 3px rgba(0, 0, 0, 0.1)");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData = data.map(d => ({
      date: parseDate(d.date),
      doses: d.doses
    }));

    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.doses)])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.doses))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2563eb")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2563eb")
      .attr("stop-opacity", 0.6);

    // Add area under line
    const area = d3.area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.doses))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(processedData)
      .attr("fill", "url(#gradient)")
      .attr("d", area);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 3)
      .attr("d", line);

    g.selectAll(".dot")
      .data(processedData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.doses))
      .attr("r", 5)
      .attr("fill", "#2563eb")
      .style("opacity", 0.8);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")))
      .selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#374151");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#374151");

    // X-axis label
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", height + margin.top + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Date");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -(height + margin.top) / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Number of Doses");

    // Title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .style("fill", "#1F2937")
      .text(title);
  };

  useEffect(() => {
    if (!loading && activeTab === 'demographics') {
      createBarChart(ageChartRef, reports.ageGroups, "Vaccinations by Age Group", "#2563eb");
      createPieChart(genderChartRef, reports.genderGroups, "Vaccinations by Gender");
      createBarChart(diseaseChartRef, reports.diseaseGroups, "Vaccinations by Pre-existing Disease", "#059669");
      createBarChart(professionChartRef, reports.professionGroups, "Vaccinations by Profession", "#dc2626");
    }
  }, [reports, loading, activeTab]);

  useEffect(() => {
    if (!loading && activeTab === 'doses') {
      createLineChart(dailyDosesChartRef, reports.dailyDoses, "Daily Doses Administered");
    }
  }, [reports, loading, activeTab]);

  useEffect(() => {
    if (!loading && activeTab === 'coverage') {
      createPieChart(populationChartRef, {
        Vaccinated: reports.populationCoverage.vaccinatedPopulation || 0,
        Unvaccinated: reports.populationCoverage.unvaccinatedPopulation || 0
      }, "Population Coverage");
    }
  }, [reports, loading, activeTab]);

  useEffect(() => {
    if (!loading && activeTab === 'distribution') {
      createPieChart(vaccineChartRef, reports.vaccineDistribution, "Vaccine Distribution");
      createBarChart(hospitalChartRef, reports.hospitalPerformance, "Hospital Performance", "#7c3aed");
    }
  }, [reports, loading, activeTab]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#6B7280' }}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Vaccination WatchList Banner */}
      <VaccinationWatchList 
        autoRotate={true}
        rotationInterval={5000}
        showQuickStats={true}
        height={200}
      />
      
      <div style={{ background: '#ffffff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: 8, color: '#1F2937', fontSize: 28, fontWeight: '700' }}>Vaccination Reports Dashboard</h2>
        <p style={{ color: '#6B7280', marginBottom: 32, fontSize: 16 }}>Comprehensive analytics and insights for vaccination data</p>
        
        {/* Tab Navigation */}
        <div style={{ marginBottom: 32, borderBottom: '2px solid #f3f4f6' }}>
          {[
            { key: 'demographics', label: 'Demographics', icon: '👥' },
            { key: 'doses', label: 'Daily Doses', icon: '📊' },
            { key: 'coverage', label: 'Population Coverage', icon: '🎯' },
            { key: 'distribution', label: 'Distribution', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px',
                margin: '0 8px 0 0',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
                background: activeTab === tab.key ? '#eff6ff' : 'transparent',
                color: activeTab === tab.key ? '#2563eb' : '#6B7280',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '500',
                fontSize: 16,
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ marginRight: 8 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demographics Tab */}
        {activeTab === 'demographics' && (
          <div>
            <h3 style={{ color: '#1F2937', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Demographic Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={ageChartRef}></div>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={genderChartRef}></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={diseaseChartRef}></div>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={professionChartRef}></div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Doses Tab */}
        {activeTab === 'doses' && (
          <div>
            <h3 style={{ color: '#1F2937', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Daily Doses Administered</h3>
            <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 24 }}>
              <div ref={dailyDosesChartRef}></div>
            </div>
            <div style={{ padding: 24, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h4 style={{ color: '#1F2937', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>📊 Summary Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Total Appointments</p>
                  <p style={{ color: '#2563eb', fontSize: 24, fontWeight: '700', margin: 0 }}>{reports.dailyDoses.reduce((sum, d) => sum + d.doses, 0)}</p>
                </div>
                <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Average Daily Doses</p>
                  <p style={{ color: '#059669', fontSize: 24, fontWeight: '700', margin: 0 }}>{reports.dailyDoses.length > 0 ? Math.round(reports.dailyDoses.reduce((sum, d) => sum + d.doses, 0) / reports.dailyDoses.length) : 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Population Coverage Tab */}
        {activeTab === 'coverage' && (
          <div>
            <h3 style={{ color: '#1F2937', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Population Coverage Analysis</h3>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={populationChartRef}></div>
              </div>
              <div style={{ padding: 32, background: '#f8fafc', borderRadius: 12, minWidth: 350, border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#1F2937', fontSize: 20, fontWeight: '600', marginBottom: 24 }}>📈 Coverage Statistics</h4>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Total Population:</span>
                    <span style={{ color: '#1F2937', fontWeight: '700' }}>{reports.populationCoverage.totalPopulation}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Vaccinated:</span>
                    <span style={{ color: '#059669', fontWeight: '700' }}>{reports.populationCoverage.vaccinatedPopulation}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Unvaccinated:</span>
                    <span style={{ color: '#dc2626', fontWeight: '700' }}>{reports.populationCoverage.unvaccinatedPopulation}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Coverage Percentage:</span>
                    <span style={{ color: '#2563eb', fontWeight: '700', fontSize: 18 }}>{reports.populationCoverage.coveragePercentage}%</span>
                  </div>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: 24, 
                  background: '#e5e7eb', 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  marginTop: 16,
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: `${reports.populationCoverage.coveragePercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #059669, #10b981)',
                    transition: 'width 1s ease-in-out',
                    borderRadius: '12px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <div>
            <h3 style={{ color: '#1F2937', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Vaccine & Hospital Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={vaccineChartRef}></div>
              </div>
              <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div ref={hospitalChartRef}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
