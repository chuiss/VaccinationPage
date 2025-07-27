const express = require('express');
const router = express.Router();
const Appointment = require('../DataModel/Appointment');
const User = require('../DataModel/User');
const Hospital = require('../DataModel/Hospital');
const Vaccine = require('../DataModel/Vaccine');

// Create appointment
router.post('/', async (req, res) => {
  console.log('POST /api/appointments called with body:', req.body);
  try {
    const appointment = new Appointment({
      ...req.body,
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

// List appointments by status
router.get('/', async (req, res) => {
  console.log('GET /api/appointments called');
  try {
    const status = req.query.status;
    let query = {};
    if (status) query.status = status;
    const appointments = await Appointment.find(query)
      .populate('userId hospitalId vaccineId');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin approve/deny appointment
router.put('/:id/approve', async (req, res) => {
  console.log('PUT /api/appointments/' + req.params.id + '/approve called');
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

// Delete appointment by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
