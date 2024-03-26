// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
   
  },
  // Add other fields as needed
});
// Hash the password before saving to the database
userSchema.pre('save', async function(next) {
    try {
      if (!this.isModified('password')) {
        return next();
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // Method to compare passwords
  userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      return false;
    }
  };
const User = mongoose.model('User', userSchema);

module.exports = User;
