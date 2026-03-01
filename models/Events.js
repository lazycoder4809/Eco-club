const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === '' || /https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0 
  },
  likedBy: [  
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ]
}, { timestamps: true });


eventSchema.virtual("isPast").get(function () {
  const comparisonDate = this.endDate || this.date;
  return comparisonDate ? comparisonDate < new Date() : false;
});


eventSchema.pre("validate", function (next) {
  if (!this.date && (!this.startDate || !this.endDate)) {
    this.invalidate("date", "Either date or both startDate and endDate must be provided");
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
