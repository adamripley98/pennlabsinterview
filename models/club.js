// Import frameworks
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema contains pertinent information about the club
const clubSchema = new Schema({
  name: String,
  size: Number,
});

/**
 * Club model using schema
 */
module.exports = mongoose.model('Club', clubSchema);
