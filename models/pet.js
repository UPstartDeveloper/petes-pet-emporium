"use strict";
// import mongoose itself
const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

// import module needed for pagination as well
const mongoosePaginate = require('mongoose-paginate');

// For the Pets:
const PetSchema = new Schema({
// name of field    // type of data we want in the field
    name            : { type: String, required: true }
  , birthday        : { type: String, required: true }
  , species         : { type: String, required: true }
  , picUrl          : { type: String }
  , picUrlSq        : { type: String }
  , avatarUrl       : { type: String, required: true }  // points to an img stored in the cloud
  , favoriteFood    : { type: String, required: true }
  , description     : { type: String, minlength: 140, required: true}
},
// add on optional fields to the Schema
{
  timestamps: true
});


// Enable pagination via mongoose
mongoosePaginate.paginate.options = {
  limit: 3 // how many records on each page
};
PetSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Pet', PetSchema);
