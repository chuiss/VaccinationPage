const express = require('express');
const router = express.Router();
const Vaccine = require('../DataModel/Vaccine');
const mongoose = require('mongoose');

// List vaccines - MUST come before /:id route
router.get('/', async (req, res) => {
  console.log('GET /api/vaccines called');
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    console.error('Error listing vaccines:', err);
    res.status(500).json({ error: err.message });
  }
});

// Register vaccine - POST should come before /:id route
router.post('/', async (req, res) => {
  console.log('POST /api/vaccines called with body:', req.body);
  try {
    const vaccine = new Vaccine(req.body);
    await vaccine.save();
    res.status(201).json(vaccine);
  } catch (err) {
    console.error('Error creating vaccine:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get vaccine by ID - MUST come after specific routes
router.get('/:id', async (req, res) => {
  console.log('GET /api/vaccines/' + req.params.id + ' called');
  try {
    // Get all vaccines and filter for the specific ID
    const allVaccines = await Vaccine.find();
    console.log(`Found ${allVaccines.length} total vaccines in database`);
    
    // Filter for the specific vaccine by ID
    const vaccine = allVaccines.find(v => v._id.toString() === req.params.id);
    
    if (!vaccine) {
      console.log(`Vaccine not found with ID: ${req.params.id}`);
      console.log('Available vaccine IDs:', allVaccines.map(v => v._id.toString()));
      return res.status(404).json({ error: 'Vaccine not found' });
    }
    
    console.log(`Found vaccine: ${vaccine.name}`);
    res.json(vaccine);
  } catch (err) {
    console.error('Error finding vaccine:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete vaccine by ID
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/vaccines/' + req.params.id + ' called');
  try {
    const result = await Vaccine.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Vaccine not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vaccine:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
