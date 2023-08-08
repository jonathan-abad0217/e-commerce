const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

module.exports.registerUser = (user_body) => {
  const {
    name,
    email,
    password,
    mobileNumber,
    address: [{ streetNumber, barangay, municipality, province }],
  } = user_body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  let newUser = new User({
    name,
    email,
    password: hashedPassword,
    mobileNumber,
    address: [{ streetNumber, barangay, municipality, province }],
  });
  return newUser
    .save()
    .then((registeredUser, error) => {
      if (error) {
        return {
          message: error.message,
        };
      }
      return {
        message: "Successfully registered a user!",
        data: registeredUser,
      };
    })
    .catch((error) => console.log(error));
};

// Login
module.exports.loginUser = (request, response) => {
  return User.findOne({ email: request.body.email })
    .then((user) => {
      if (user == null) {
        return response.send({
          message: "The user isn't registered yet.",
        });
      }
      const isPasswordCorrect = bcrypt.compareSync(
        request.body.password,
        user.password
      );
      if (isPasswordCorrect) {
        return response.send({
          accessToken: auth.createAccessToken(user),
        });
      } else {
        return response.send({
          message: "Password is incorrect.",
        });
      }
    })
    .catch((error) => response.send(error));
};

module.exports.getDetails = (user) => {
  return User.findById({ _id: user.id }).then((result, error) => {
    if (error) {
      return response.send({
        message: error.message,
      });
    }
    if (!result) {
      return response.send({
        message: "User not found",
      });
    }
    result.password = "";
    return {
      user: result,
    };
  });
};

module.exports.order = (request, response) => {
  if (request.user.isAdmin) {
    return response.status(403).json({
      message: "Action Forbidden",
    });
  }

  const { products } = request.body;

  // Calculate total amounts for each product and overall order
  let totalAmount = 0;
  const productsWithTotal = products.map(async (product) => {
    const { productId, quantity } = product;

    try {
      // Retrieve product price from the database based on productId
      const foundProduct = await Product.findOne({ _id: productId });

      if (!foundProduct) {
        throw new Error("Product not found");
      }

      const productName = foundProduct.name;
      const productPrice = foundProduct.price;

      // Calculate total for the current product
      const productTotal = productPrice * quantity;
      totalAmount += productTotal;

      return {
        productId,
        productName,
        quantity,
        total: productTotal,
      };
    } catch (error) {
      return response.status(400).json({
        message: `Error retrieving product price for product with ID ${productId}`,
        error: error.message,
      });
    }
  });

  Promise.all(productsWithTotal)
    .then((productsWithCalculatedTotal) => {
      const order = new Order({
        userId: request.user.id,
        userName: request.user.name,
        products: productsWithCalculatedTotal,
        totalAmount,
      });

      return order.save();
    })
    .then((savedOrder) => {
      return response.status(201).json({
        message: "Order created successfully",
        data: savedOrder,
      });
    })
    .catch((error) => {
      return response.status(500).json({
        message: "An error occurred while creating the order",
        error: error.message,
      });
    });
};

// set user as admin
module.exports.setAsAdmin = (request, response) => {
  let set_asAdmin = {
    isAdmin: true,
  };
  return User.findByIdAndUpdate(request.params.id, set_asAdmin)
    .then((result, error) => {
      if (error) {
        return response.send({
          message: error.message,
        });
      }
      return response.send({
        message: "User has been set to admin",
      });
    })
    .catch((error) => console.log(error));
};
