const express = require('express');
const router = express.Router();
const Appointment = require('../DataModel/Appointment');
const Hospital = require('../DataModel/Hospital');
const Vaccine = require('../DataModel/Vaccine');
const User = require('../DataModel/User');
const mongoose = require('mongoose');

// Cache for reference data
let hospitalMap = {};
let vaccineMap = {};
let userMap = {};
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load all reference data into memory
const loadReferenceData = async () => {
  try {
    const [hospitals, vaccines, users] = await Promise.all([
      Hospital.find({}).lean(),
      Vaccine.find({}).lean(),
      User.find({}).lean()
    ]);
    
    // Create lookup maps
    hospitalMap = {};
    hospitals.forEach(h => hospitalMap[h._id.toString()] = h);
    
    vaccineMap = {};
    vaccines.forEach(v => vaccineMap[v._id.toString()] = v);
    
    userMap = {};
    users.forEach(u => userMap[u._id.toString()] = u);
    
    lastCacheUpdate = Date.now();
    console.log(`Reference data loaded: ${hospitals.length} hospitals, ${vaccines.length} vaccines, ${users.length} users`);
  } catch (error) {
    console.error('Error loading reference data:', error);
  }
};

// Check if cache needs refresh
const ensureCacheUpdated = async () => {
  if (Date.now() - lastCacheUpdate > CACHE_DURATION || Object.keys(hospitalMap).length === 0) {
    await loadReferenceData();
  }
};

// Initialize cache on module load
loadReferenceData();

// Helper function to perform manual joins - super optimized
const joinAppointmentData = (appointments) => {
  return appointments.map(appointment => {
    const appointmentObj = appointment.toObject ? appointment.toObject() : appointment;
    
    // Join with Hospital
    if (appointmentObj.hospitalId) {
      const hospital = hospitalMap[appointmentObj.hospitalId.toString()];
      if (hospital) {
        appointmentObj.hospitalName = hospital.name;
        appointmentObj.hospitalAddress = hospital.address;
        appointmentObj.hospitalCharges = hospital.charges;
        appointmentObj.hospitalType = hospital.type;
      }
    }
    
    // Join with Vaccine
    if (appointmentObj.vaccineId) {
      const vaccine = vaccineMap[appointmentObj.vaccineId.toString()];
      if (vaccine) {
        appointmentObj.vaccineName = vaccine.name;
        appointmentObj.vaccineType = vaccine.type;
        appointmentObj.vaccinePrice = vaccine.price;
        appointmentObj.vaccineSideEffects = vaccine.sideEffects;
        appointmentObj.vaccineOrigin = vaccine.origin;
        appointmentObj.vaccineDosesRequired = vaccine.dosesRequired;
        appointmentObj.vaccineStrainsCovered = vaccine.strainsCovered;
      }
    }
    
    // Join with User
    if (appointmentObj.userId) {
      const user = userMap[appointmentObj.userId.toString()];
      if (user) {
        appointmentObj.user = user;
      }
    }
    
    return appointmentObj;
  });
};

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { userId, userName, hospitalId, vaccineId, date, time } = req.body;
    
    const appointment = new Appointment({
      userId: userId || null,
      userName,
      hospitalId: hospitalId || null,
      vaccineId: vaccineId || null,
      date: new Date(date),
      time,
      status: 'pending'
    });
    
    // Auto-reject if date is in the past
    if (new Date(appointment.date) < new Date()) {
      appointment.status = 'rejected';
    }
    
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List appointments by status with joins
router.get('/', async (req, res) => {
  try {
    // Ensure cache is updated
    await ensureCacheUpdated();
    
    const status = req.query.status;
    let query = {};
    if (status) query.status = status;
    
    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 });
    
    // Perform manual joins using cached data
    const appointmentsWithJoins = joinAppointmentData(appointments);
    
    res.json(appointmentsWithJoins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments for a specific user by username with joins
router.get('/user/:username', async (req, res) => {
  try {
    // Ensure cache is updated
    await ensureCacheUpdated();
    
    const { username } = req.params;
    const status = req.query.status;
    
    let query = { userName: username };
    if (status) query.status = status;
    
    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 });
    
    // Perform manual joins using cached data
    const appointmentsWithJoins = joinAppointmentData(appointments);
    
    res.json(appointmentsWithJoins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin approve/deny appointment
router.put('/:id/approve', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes((status || '').toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    appointment.status = status.toLowerCase();
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
