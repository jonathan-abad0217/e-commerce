const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController.js");
const auth = require("../auth.js");

// Create product
router.post("/add", auth.verify, auth.verifyAdmin, (request, response) => {
  productController.createProduct(request.body).then((result) => {
    response.send(result);
  });
});

// Get all product
router.get("/all", (request, response) => {
  productController.getAll(request, response);
});

// Get all active product
router.get("/all/active", (request, response) => {
  productController.getActive(request, response);
});

// get specific product by id
router.post("/:id", (request, response) => {
  productController.getProductById(request, response);
});

// get specific product by name
router.post("/", (request, response) => {
  productController.getProductByName(request, response);
});

// update product information using params id
router.put("/:id", auth.verify, auth.verifyAdmin, (request, response) => {
  productController.updateProduct(request, response);
});

// Archive/deactivate product
router.put(
  "/:id/archive",
  auth.verify,
  auth.verifyAdmin,
  (request, response) => {
    productController.archiveProduct(request, response);
  }
);

// Activate product
router.put(
  "/:id/activate",
  auth.verify,
  auth.verifyAdmin,
  (request, response) => {
    productController.activateProduct(request, response);
  }
);

module.exports = router;
