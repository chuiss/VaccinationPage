const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: String,
  address: String,
  type: String,
  charges: Number
});

module.exports = mongoose.model('Hospital', HospitalSchema);
