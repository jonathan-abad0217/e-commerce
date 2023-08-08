const User = require("./models/User"); // Update the import path
const Cart = require("./models/Cart"); // Update the import path
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Connect to the MongoDB database
mongoose.connect(
  `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@project-x.ncwp3an.mongodb.net/project-x?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const createUserWithCart = async () => {
  try {
    // Create a new user
    const newUser = new User({
      name: "John Doe", // Replace with desired user data
      email: "john@example.com",
      password: bcrypt.hashSync("10235000", 10),
      mobileNumber: "1234567890",
      address: [
        {
          streetNumber: "123",
          barangay: "Sample Barangay",
          municipality: "Sample Municipality",
          province: "Sample Province",
        },
      ],
      isAdmin: false,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Create a new cart and associate it with the user's ID
    const newCart = new Cart({
      userId: savedUser._id, // Set the user's ID as the userId
      items: [], // Initialize items as an empty array
    });

    // Save the cart to the database
    const savedCart = await newCart.save();

    // Update the user's cart reference
    savedUser.cart = savedCart._id;
    await savedUser.save();

    console.log("User with cart created:", savedUser, savedCart);
  } catch (error) {
    console.error("Error creating user with cart:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Call the function to create the user with cart
createUserWithCart();
