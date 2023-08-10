const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const auth = require("../auth.js");

// Register user
router.post("/register", (request, response) => {
  userController.registerUser(request.body).then((result) => {
    response.send(result);
  });
});

// Login user
router.post("/login", (request, response) => {
  userController.loginUser(request, response);
});

// retrieve user details
router.post("/details", (request, response) => {
  userController.getDetails(request.body).then((result) => {
    response.send(result);
  });
});

// Get all Orders
router.get("/allOrder", auth.verify, auth.verifyAdmin, (request, response) => {
  userController.getAllOrders(request, response);
});

// retrieve authenticated user's order
router.get("/orders", auth.verify, (request, response) => {
  userController.getUserOrders(request, response);
});

// Create order non admin
router.post("/order", auth.verify, (request, response) => {
  userController.order(request, response);
});

// Set user as admin (admin only)
router.put(
  "/:id/setAsAdmin",
  auth.verify,
  auth.verifyAdmin,
  (request, response) => {
    userController.setAsAdmin(request, response);
  }
);

// add/edit to cart for authenticated user
router.post("/addToCart", auth.verify, (request, response) => {
  userController.addToCart(request, response);
});

// remove product in cart
router.delete("/cart/:productId", auth.verify, (request, response) => {
  userController.removeFromCart(request, response);
});

// place order/ checkout of the cart of user
router.post("/place-order", auth.verify, (request, response) => {
  userController.placeOrder(request, response);
});

module.exports = router;
