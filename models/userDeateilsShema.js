const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  aboutMe: {
    type: String,
    default: "",
    maxlength: 500,
  },
  scores: {
    type: Number,
    default: 0,
  },


  eventsVisited: [
    {
      type: String,
      trim: true,
    },
 
  ],


  eventsAttended: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: [],  
    }
  ],

  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserBasic",
    }
  ],
  profileImage: {
    type: String,
    default: "default-profile.png",
  },
  isTopLiked: {
    type: Boolean,
    default: false,
  },
  completedChallenges: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model("UserBasic", userSchema);