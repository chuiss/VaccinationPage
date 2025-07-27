
const express = require('express');
const router = express.Router();
const Hospital = require('../DataModel/Hospital');

// Delete hospital by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Hospital.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Hospital not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register hospital
router.post('/', async (req, res) => {
  console.log('POST /api/hospitals called with body:', req.body);
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List hospitals
router.get('/', async (req, res) => {
  console.log('GET /api/hospitals called');
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
