const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  sId: { type: Number }, 
  gameId: { type: Number }, 
  quizId: { type: String, required: true, unique: true }, 
  creatorName: { type: String },
  creatorWallet: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  title: { type: String }, 
  description: { type: String },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String, 
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
    },
  ],
  maxParticipants: { type: Number, required: true },
  totalCost: { type: Number, required: true }, 
  questionCount: { type: Number, required: true },
  rewardPerScore: { type: Number, required: true }, 
  isPublic: { type: Boolean, default: false }, 
  isFinished: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },

  participants: [
    {
      user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      score: { 
        type: Number,
        default: null
      },
      reward: { 
        type: Number,
        default: null
      },
      joinedAt: { 
        type: Date,
        default: Date.now
      },
      _id: false
    }
  ]
});

quizSchema.pre('save', function(next) {
    this.questions.forEach(q => {
        if (!q._id) {
            q._id = new mongoose.Types.ObjectId();
        }
    });
    if (!this.title && this.prompt) {
        this.title = this.prompt.substring(0, 50) + (this.prompt.length > 50 ? '...' : '');
    }
    next();
});


module.exports = mongoose.model("Quiz", quizSchema);