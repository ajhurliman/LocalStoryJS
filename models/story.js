'use strict';

var mongoose = require('mongoose');

var storySchema = mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  title: String,
  storyBody: String,
  date: Date,
  img: {type: mongoose.Schema.Types.ObjectId, ref: 'fs.file'},
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Story', storySchema);
