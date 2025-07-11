const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
    },
    isUpdate: {
      type: Boolean,
      required: true,
      default: false,
    },
    initData: {
      type: Object,
      required: true,
    },
    badGirl: {
      reviews: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'open'
      },
      diagnostics: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'open'
      },
      introductoryDay: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      day1: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      day2: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      day3: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      instructions: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      day4: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      tutorial: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      day5: {
        type: String,
        enum: ['open', 'close', 'pending', 'finished', 'update'],
        default: 'close'
      },
      currentDay: {
        type: Number,
        default: 0
      },
      startedAt: {
        type: Date
      },
      finishedAt: {
        type: Date
      }
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
