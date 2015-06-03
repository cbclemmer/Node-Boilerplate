var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    //owner's ID
    owner: Object,
    title: String,
    //slug for url
    slug: String,
    //what the post is being targeted at, ID
    target: String,
    //like 'likes'
    hearts: String,
    content: String,
    preview: String,
    public: Boolean,
    createdOn: Date,
    lastUpdated: Date
});