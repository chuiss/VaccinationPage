const express = require('express');
const router = express.Router();
const Vaccine = require('../DataModel/Vaccine');

// Register vaccine
router.post('/', async (req, res) => {
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
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
