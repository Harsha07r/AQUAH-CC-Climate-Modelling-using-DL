const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    widgetData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);