const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'patient'], default: 'patient' },
  name: String,
  age: Number,
  profession: String,
  contact: String,
  address: String,
  gender: String,
  disease: String,
});

module.exports = mongoose.model('User', UserSchema);
