const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

/* The following plugin will add on to our schema a username and password. 
It's going to make sure those usernames are unique, they're not duplicated. 
It's also going to give us some additional methods that we can use. */
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);