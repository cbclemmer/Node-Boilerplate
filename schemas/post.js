var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    //owner's ID
    owner: String,
    title: String,
    //slug for url
    slug: String,
    //what the post is being targeted at, ID
    target: String,
    //like 'likes'
    hearts: String,
    content: String,
    public: Boolean,
    createdOn: Date,
    lastUpdated: Date
});