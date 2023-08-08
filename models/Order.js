const mongoose = require("mongoose");

const order_schema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "userId is required"],
  },
  userName: {
    type: String,
    require: [true, "userName is required"],
  },
  products: [
    {
      productId: {
        type: String,
      },
      productName: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      total: {
        type: Number,
      },
    },
  ],
  totalAmount: {
    type: Number,
  },
  purchasedOn: {
    type: Date,
    default: new Date(),
  },
});

const Order = mongoose.model("Order", order_schema);
module.exports = Order;
