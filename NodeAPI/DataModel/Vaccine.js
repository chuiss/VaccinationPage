const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  origin: String,
  dosesRequired: Number,
  description: String
});

module.exports = mongoose.model('Vaccine', VaccineSchema);
