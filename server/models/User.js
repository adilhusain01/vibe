const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true 
  },
  name: {
    type: String
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  authType: {
    type: String,
    enum: ['google', 'github', 'email', 'wallet'],
    default: 'wallet'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  quizzesTaken: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  quizzesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }]
});

module.exports = mongoose.model("User", userSchema);