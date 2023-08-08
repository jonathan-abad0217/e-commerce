const Product = require("../models/Product.js");

module.exports.createProduct = (product) => {
  let new_product = new Product({
    name: product.name,
    description: product.description,
    price: parseInt(product.price),
  });
  return new_product
    .save()
    .then((createdProduct, error) => {
      if (error) {
        return {
          message: error.message,
        };
      }
      return {
        product: createdProduct,
      };
    })
    .catch((error) => console.log(error));
};

module.exports.getAll = (request, response) => {
  return Product.find({}).then((result) => {
    return response.send(result);
  });
};

module.exports.getActive = (request, response) => {
  return Product.find({ isActive: true }).then((result) => {
    return response.send(result);
  });
};

module.exports.getProductById = (request, response) => {
  return Product.findById(request.params.id).then((result) => {
    return response.send(result);
  });
};

module.exports.getProductByName = (request, response) => {
  return Product.findOne({
    name: {
      $regex: request.body.name,
      $options: "i",
    },
  }).then((result) => {
    return response.send(result);
  });
};

module.exports.updateProduct = (request, response) => {
  let updated_product = {
    name: request.body.name,
    description: request.body.description,
    price: parseInt(request.body.price),
  };
  return Product.findByIdAndUpdate(request.params.id, updated_product)
    .then((product, error) => {
      if (error) {
        return response.send({
          message: error.message,
        });
      }
      return response.send({
        message: "Product has been updated successfully!",
        product: product,
      });
    })
    .catch((error) => console.log(error));
};

module.exports.archiveProduct = (request, response) => {
  let archive_product = {
    isActive: false,
  };
  return Product.findByIdAndUpdate(request.params.id, archive_product)
    .then((product, error) => {
      if (error) {
        return response.send({
          message: error.message,
        });
      }
      return response.send({
        message: "Product has been archived!",
      });
    })
    .catch((error) => console.log(error));
};
module.exports.activateProduct = (request, response) => {
  let activate_product = {
    isActive: true,
  };
  return Product.findByIdAndUpdate(request.params.id, activate_product)
    .then((product, error) => {
      if (error) {
        return response.send({
          message: error.message,
        });
      }
      return response.send({
        message: "Product has been activated!",
      });
    })
    .catch((error) => console.log(error));
};
