// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true // This is the secret Firebase ID!
  },
  email: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String 
  },
  farmDetails: {
    soilType: { type: String, default: "" },
    waterLevel: { type: String, default: "" },
    farmSize: { type: String, default: "" }
  }
}, { timestamps: true });

// Use specific collection name to avoid conflicts with old DevTinder.users collection
module.exports = mongoose.model('User', userSchema, 'aquah_users');