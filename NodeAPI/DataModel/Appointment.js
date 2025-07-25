const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  date: Date,
  time: String,
  title: String,
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine' },
  status: { type: String, default: 'pending' } // pending, approved, denied, rejected
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
