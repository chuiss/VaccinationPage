const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  date: Date,
  time: String,
  title: String,
  location: String,
  userId: String, // Changed from ObjectId to String
  userName: String,
  hospitalId: String, // Changed from ObjectId to String
  vaccineId: String, // Changed from ObjectId to String
  status: { type: String, default: 'pending' } // pending, approved, denied, rejected
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
