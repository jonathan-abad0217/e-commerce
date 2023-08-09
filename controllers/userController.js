const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
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

module.exports.getAllOrders = (request, response) => {
  return Order.find({}).then((orders) => {
    return response.send(orders);
  });
};

module.exports.getUserOrders = async (request, response) => {
  const userId = request.user.id;

  try {
    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return response.json({ message: "No orders found for the user" });
    }
    response.json({
      message: "User's orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  }
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

module.exports.addToCart = async (request, response) => {
  const userId = request.user.id;
  const productsToAdd = request.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalAmount: 0,
      });
    }

    for (const productInfo of productsToAdd) {
      const { productId, quantity } = productInfo;
      const product = await Product.findById(productId);

      if (!product) {
        return response.status(404).json({
          error: `Product with ID ${productId} not found`,
        });
      }

      const total = product.price * quantity;

      const existingProduct = cart.products.find(
        (p) => p.productId === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
        existingProduct.total += total;
      } else {
        cart.products.push({
          productId,
          productName: product.name,
          quantity,
          total,
        });
      }

      cart.totalAmount += total;
    }

    await cart.save();

    return response.json({
      message: "Products added to cart successfully",
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports.placeOrder = async (request, response) => {
  const userId = request.user.id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return response.status(400).json({ error: "Cart is empty" });
    }

    // Create an order from the cart
    const order = new Order({
      userId,
      userName: request.user.name,
      products: cart.products,
      totalAmount: cart.totalAmount,
    });

    // Clear the user's cart
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    // Save the order
    await order.save();
    console.log(order);
    response
      .status(201)
      .json({ message: "Order placed successfully", data: order });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  }
};
