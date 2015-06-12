var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    to: Object,
    from: Object,
    content: String,
    createdOn: Date
});