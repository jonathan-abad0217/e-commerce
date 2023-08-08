const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "E-mail is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  mobileNumber: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: [
    {
      streetNumber: {
        type: String,
        required: true,
      },
      barangay: {
        type: String,
        required: true,
      },
      municipality: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
    },
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    // The "new Date()" expression instantiates a new "date" that stores the current date and time whenever a course is created in our database
    default: new Date(),
  },
});

module.exports = mongoose.model("User", userSchema);
