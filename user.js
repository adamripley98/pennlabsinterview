// Import frameworks
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema contains pertinent information about the user
const userSchema = new Schema({
  name: String,
  username: String,
  password: String,
});

/**
 * User model using schema
 */
module.exports = mongoose.model('User', userSchema);
