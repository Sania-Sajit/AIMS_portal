const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'faculty'],
    default: 'student'
  }
});

// Export User model
const User = mongoose.model('User', userSchema);
module.exports = User;