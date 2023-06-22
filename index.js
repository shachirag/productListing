const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
app.use(express.json());
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/register.js");
const Product = require("./models/product.js");

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("./public"));

const checkAuthorization = (req, res, next) => {
  try {
    const decodedToken = jwt.verify(
      req.headers.token,
      process.env.JWT_SECRET_KEY
    );
    req.user = decodedToken;
    next();
  } catch (error) {
    res.send({
      Status: "failed",
      Message: "Unauthorized",
    });
  }
};

app.get("/health-api", (req, res) => {
  res.send("Working!");
});

app.post("/register", async (req, res) => {
  const { username, useremail, usermobile, userpassword } = req.body;

  try {
    const oldUser = await User.findOne({ useremail });
    if (oldUser) {
      return res.json({ Message: "User already Exists" });
    }
    const encryptedPassword = await bcrypt.hash(userpassword, 10);
    await User.create({
      username,
      useremail,
      usermobile,
      userpassword: encryptedPassword,
    });
    res.send({ Message: "User created Successfully" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.post("/login", async (req, res) => {
  const { useremail, userpassword } = req.body;

  const user = await User.findOne({ useremail });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(userpassword, user.userpassword)) {
    const token = jwt.sign(
      { useremail: user.useremail },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "120m",
      }
    );
    return res.json({
      token,
      username: user.username,
      message: "User Logged In Successfully",
    });
  }
  res.json({ error: "Invalid Password" });
});

app.post("/api/addproduct", checkAuthorization, async (req, res) => {
  const { companyname, category, addlogourl, linkofproduct, adddescription } =
    req.body;

  try {
    await Product.create({
      companyname,
      category,
      addlogourl,
      linkofproduct,
      adddescription,
    });
    res.send({ Message: "Product created Successfully" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.get("/api/addproduct", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.json({ error });
  }
});

app.post("/api/filters", async (req, res) => {});

app.put("/api/editproduct/:id", (req, res) => {
  const { id } = req.params;
  const { companyname, category, addlogourl, linkofproduct, adddescription } =
    req.body;
  Product.findByIdAndUpdate(id, {
    companyname,
    category,
    addlogourl,
    linkofproduct,
    adddescription,
  })
    .then((product) =>
      res.json({
        Message: "Product updated Successfully",
        productId: product._id,
      })
    )
    .catch((error) => res.json({ error }));
});

app.use((req, res, next) => {
  const err = new Error("Something went wrong! Please try again later.");
  err.status = 404;
  next(err);
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(process.env.SERVER_PORT, () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB connection Sucessfully");
      console.log("server is running in Port 4000");
    })
    .catch((err) => console.log("DB connection failed", err));
});
