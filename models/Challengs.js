const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop'
  },

  duration: {
    type: String, 
    default: 'Не указано'
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  tags: [{
    type: String,
    trim: true
  }],

  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  likes: {
    type: Number,
    default: 0
  },

  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  submittedBy: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],


  points: {
    type: Number,
    default: 0,
    min: 0
  }

}, { timestamps: true });


challengeSchema.pre('save', function(next) {
  if (this.isModified('difficulty')) {
    if (this.difficulty === 'easy') this.points = 10;
    if (this.difficulty === 'medium') this.points = 20;
    if (this.difficulty === 'hard') this.points = 50;
  }
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
