"use strict";

const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

const PetSchema = new Schema({
// name of field    // type of data we want in the field
    name            : { type: String, required: true }
  , species         : { type: String }
  , birthday        : { type: Date }
  , picUrl          : { type: String }
  , picUrlSq        : { type: String }
  , favoriteFood    : { type: String }
  , description     : { type: String }
},
// add on optional fields to the Schema
{
  timestamps: true
});

module.exports = mongoose.model('Pet', PetSchema);
