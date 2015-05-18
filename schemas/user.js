var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    online: Boolean,
    admin: Boolean
});