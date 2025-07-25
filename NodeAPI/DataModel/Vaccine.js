const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  sideEffect: String,
  origin: String,
  dosesRequired: Number,
  otherInfo: [String] // strains covered
});

module.exports = mongoose.model('Vaccine', VaccineSchema);
