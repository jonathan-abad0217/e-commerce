const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const port = 8080;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
mongoose.connect(
  `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@project-x.ncwp3an.mongodb.net/project-x?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

let database = mongoose.connection;

database.on("error", () => console.log("Can't connect to database"));
database.once("open", () => console.log("Connected to MongoDB"));

// Routes
app.use("/e-commerce", userRoutes);
app.use("/e-commerce/products", productRoutes);
// Server listening
app.listen(process.env.PORT || port, () => {
  console.log(
    `E-commerce is now running at localhost: ${process.env.PORT || port}`
  );
});

module.exports = app;
