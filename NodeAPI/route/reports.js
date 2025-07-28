const express = require('express');
const router = express.Router();
const Appointment = require('../DataModel/Appointment');
const User = require('../DataModel/User');
const Vaccine = require('../DataModel/Vaccine');
const Hospital = require('../DataModel/Hospital');

// Helper function to filter completed appointments
function getCompletedAppointments(appointments) {
  const currentDateTime = new Date();
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(':');
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      // If no time specified, set to end of day to be conservative
      appointmentDate.setHours(23, 59, 59, 999);
    }
    
    return appointmentDate <= currentDateTime;
  });
}

// 1. Demographics Reports (Age, Gender, Pre-existing diseases)
router.get('/demographics/age', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique usernames from completed appointments
    const userNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    
    // Find users by username and get their demographic data
    const users = await User.find({ 
      username: { $in: userNames },
      role: 'patient' // Only count patients
    }, 'username age');
    
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    // Count unique users instead of appointments
    users.forEach(user => {
      if (user.age !== undefined) {
        const age = user.age;
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 30) ageGroups['19-30']++;
        else if (age <= 50) ageGroups['31-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
    });
    
    res.json(ageGroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/demographics/gender', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique usernames from completed appointments
    const userNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    
    // Find users by username and get their demographic data
    const users = await User.find({ 
      username: { $in: userNames },
      role: 'patient' // Only count patients
    }, 'username gender');
    
    const genderGroups = { Male: 0, Female: 0, Other: 0 };
    
    // Count unique users instead of appointments
    users.forEach(user => {
      if (user.gender) {
        const gender = user.gender;
        if (genderGroups[gender] !== undefined) {
          genderGroups[gender]++;
        } else {
          genderGroups['Other']++;
        }
      }
    });
    
    res.json(genderGroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/demographics/preexisting', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique usernames from completed appointments
    const userNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    
    // Find users by username and get their demographic data
    const users = await User.find({ 
      username: { $in: userNames },
      role: 'patient' // Only count patients
    }, 'username disease');
    
    const diseaseCount = {};
    
    // Count unique users instead of appointments
    users.forEach(user => {
      const disease = user.disease || 'None';
      diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
    });
    
    res.json(diseaseCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/demographics/profession', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique usernames from completed appointments
    const userNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    
    // Find users by username and get their demographic data
    const users = await User.find({ 
      username: { $in: userNames },
      role: 'patient' // Only count patients
    }, 'username profession');
    
    const professionCount = {};
    
    // Count unique users instead of appointments
    users.forEach(user => {
      const profession = user.profession || 'Unknown';
      professionCount[profession] = (professionCount[profession] || 0) + 1;
    });
    
    res.json(professionCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Daily doses administered
router.get('/daily-doses', async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: 'approved' });
    
    const dailyDoses = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.date).toISOString().split('T')[0];
      dailyDoses[date] = (dailyDoses[date] || 0) + 1;
    });
    
    // Sort by date
    const sortedDoses = Object.keys(dailyDoses)
      .sort()
      .map(date => ({ date, doses: dailyDoses[date] }));
    
    res.json(sortedDoses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Population coverage percentage
router.get('/population-coverage', async (req, res) => {
  try {
    // Count only patients (not admins) for meaningful population coverage
    const totalPatients = await User.countDocuments({ role: 'patient' });
    
    // Get all approved appointments with date/time information
    const approvedAppointments = await Appointment.find({ 
      status: 'approved',
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    const currentDateTime = new Date();
    
    // Separate scheduled vs completed appointments based on date/time
    const scheduledAppointments = [];
    const completedAppointments = [];
    
    approvedAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      // If appointment has time, create full datetime for comparison
      if (appointment.time) {
        const [hours, minutes] = appointment.time.split(':');
        appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        // If no time specified, set to end of day to be conservative
        appointmentDate.setHours(23, 59, 59, 999);
      }
      
      if (appointmentDate > currentDateTime) {
        scheduledAppointments.push(appointment);
      } else {
        completedAppointments.push(appointment);
      }
    });
    
    // Get unique patients who are scheduled for vaccination
    const scheduledUserNames = [...new Set(scheduledAppointments.map(apt => apt.userName))];
    const scheduledPatients = await User.find({
      username: { $in: scheduledUserNames },
      role: 'patient'
    }).distinct('username');
    
    // Get unique patients who are actually vaccinated (completed)
    const vaccinatedUserNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    const vaccinatedPatients = await User.find({
      username: { $in: vaccinatedUserNames },
      role: 'patient'
    }).distinct('username');
    
    const scheduledCount = scheduledPatients.length;
    const vaccinatedCount = vaccinatedPatients.length;
    const unscheduledCount = totalPatients - scheduledCount - vaccinatedCount;
    
    const scheduledPercentage = totalPatients > 0 ? (scheduledCount / totalPatients) * 100 : 0;
    const vaccinatedPercentage = totalPatients > 0 ? (vaccinatedCount / totalPatients) * 100 : 0;
    const unscheduledPercentage = totalPatients > 0 ? (unscheduledCount / totalPatients) * 100 : 0;
    
    res.json({
      totalPopulation: totalPatients,
      scheduledForVaccination: scheduledCount,
      actuallyVaccinated: vaccinatedCount,
      unscheduled: unscheduledCount,
      scheduledPercentage: Math.round(scheduledPercentage * 100) / 100,
      vaccinatedPercentage: Math.round(vaccinatedPercentage * 100) / 100,
      unscheduledPercentage: Math.round(unscheduledPercentage * 100) / 100,
      // Legacy fields for backward compatibility
      vaccinatedPopulation: vaccinatedCount,
      unvaccinatedPopulation: totalPatients - vaccinatedCount,
      coveragePercentage: Math.round(vaccinatedPercentage * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Vaccine distribution (unique users per vaccine who have been vaccinated)
router.get('/vaccine-distribution', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      vaccineId: { $exists: true, $ne: null },
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique vaccine IDs and usernames
    const vaccineIds = [...new Set(completedAppointments.map(apt => apt.vaccineId))];
    const userNames = [...new Set(completedAppointments.map(apt => apt.userName))];
    
    // Fetch all vaccines by ID
    const vaccines = await Vaccine.find({ 
      _id: { $in: vaccineIds } 
    });
    
    // Fetch all patients to verify roles
    const patients = await User.find({
      username: { $in: userNames },
      role: 'patient'
    });
    const patientUsernames = new Set(patients.map(p => p.username));
    
    // Create a map of vaccine ID to vaccine name
    const vaccineMap = {};
    vaccines.forEach(vaccine => {
      vaccineMap[vaccine._id.toString()] = vaccine.name;
    });
    
    // Track unique patients per vaccine
    const vaccineUsers = {};
    
    completedAppointments.forEach(appointment => {
      // Only count if user is a patient
      if (patientUsernames.has(appointment.userName)) {
        const vaccineName = vaccineMap[appointment.vaccineId] || 'Unknown Vaccine';
        if (!vaccineUsers[vaccineName]) {
          vaccineUsers[vaccineName] = new Set();
        }
        vaccineUsers[vaccineName].add(appointment.userName);
      }
    });
    
    // Convert to count
    const vaccineCount = {};
    Object.keys(vaccineUsers).forEach(vaccineName => {
      vaccineCount[vaccineName] = vaccineUsers[vaccineName].size;
    });
    
    res.json(vaccineCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Hospital performance (unique users per hospital who have been vaccinated)
router.get('/hospital-performance', async (req, res) => {
  try {
    // Get all approved appointments
    const allApprovedAppointments = await Appointment.find({ 
      status: 'approved',
      hospitalId: { $exists: true, $ne: null },
      userName: { $exists: true, $ne: null },
      date: { $exists: true, $ne: null }
    });
    
    // Filter to only include completed appointments (past date/time)
    const completedAppointments = getCompletedAppointments(allApprovedAppointments);
    
    // Get unique hospital IDs
    const hospitalIds = [...new Set(completedAppointments.map(apt => apt.hospitalId))];
    
    // Fetch all hospitals by ID
    const hospitals = await Hospital.find({ 
      _id: { $in: hospitalIds } 
    });
    
    // Create a map of hospital ID to hospital name
    const hospitalMap = {};
    hospitals.forEach(hospital => {
      hospitalMap[hospital._id.toString()] = hospital.name;
    });
    
    // Track unique patients per hospital
    const hospitalUsers = {};
    
    for (const appointment of completedAppointments) {
      const hospitalName = hospitalMap[appointment.hospitalId] || 'Unknown Hospital';
      if (!hospitalUsers[hospitalName]) {
        hospitalUsers[hospitalName] = new Set();
      }
      
      // Verify the user is a patient
      const user = await User.findOne({ username: appointment.userName, role: 'patient' });
      if (user) {
        hospitalUsers[hospitalName].add(appointment.userName);
      }
    }
    
    // Convert to count
    const hospitalCount = {};
    Object.keys(hospitalUsers).forEach(hospitalName => {
      hospitalCount[hospitalName] = hospitalUsers[hospitalName].size;
    });
    
    res.json(hospitalCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic endpoint to check data integrity
router.get('/debug/data-integrity', async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const approvedAppointments = await Appointment.countDocuments({ status: 'approved' });
    const appointmentsWithUserName = await Appointment.countDocuments({ 
      status: 'approved', 
      userName: { $exists: true, $ne: null } 
    });
    
    // Sample appointment data
    const sampleAppointment = await Appointment.findOne({ status: 'approved' });
    
    // Get sample usernames from appointments
    const sampleUserNames = await Appointment.find({ status: 'approved' })
      .limit(5)
      .select('userName');
    
    // Get sample users
    const sampleUsers = await User.find().limit(5).select('username age gender profession disease');
    
    res.json({
      totalAppointments,
      approvedAppointments,
      appointmentsWithUserName,
      sampleAppointment: sampleAppointment ? {
        _id: sampleAppointment._id,
        userName: sampleAppointment.userName,
        userId: sampleAppointment.userId,
        hospitalId: sampleAppointment.hospitalId,
        vaccineId: sampleAppointment.vaccineId
      } : null,
      sampleUserNamesFromAppointments: sampleUserNames.map(apt => apt.userName),
      sampleUsersFromDB: sampleUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
