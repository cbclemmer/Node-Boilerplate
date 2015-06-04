var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    // User details
    owner: Object,
    /*
        fr: friend reuest
        mess: message
    */
    type: String,
    /*
        0: not seen
        1: seen
        2: ignore 
    */
    state: Number,
    // the id of the other object
    reference: String,
    // The other user associated with the notification
    other: Object,
    createdOn: Date,
});