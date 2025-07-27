
const express = require('express');
const router = express.Router();
const Vaccine = require('../DataModel/Vaccine');

// Delete vaccine by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Vaccine.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Vaccine not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register vaccine
router.post('/', async (req, res) => {
  console.log('POST /api/vaccines called with body:', req.body);
  try {
    const vaccine = new Vaccine(req.body);
    await vaccine.save();
    res.status(201).json(vaccine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List vaccines
router.get('/', async (req, res) => {
  console.log('GET /api/vaccines called');
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
