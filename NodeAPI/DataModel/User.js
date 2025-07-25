const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  profession: String,
  contact: String,
  address: String,
  gender: String,
  disease: String,
});

module.exports = mongoose.model('User', UserSchema);
