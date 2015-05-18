var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    //holds the two users
    users: Array,
    /*
        1: requested
        2: friends
    */
    state: Number
});