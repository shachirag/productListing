const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  companyname: String,
  category: String,
  addlogourl: String,
  linkofproduct: String,
  adddescription: String,
});

module.exports = Product;
