const mongoose = require("mongoose");

const Register = mongoose.model("Register", {
  username: String,
  useremail: { type: String, unique: true },
  usermobile: Number,
  userpassword: String,
});

module.exports = Register;
