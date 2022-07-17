const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const Product = require("./Product");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("./isAuthenticated");
var order;

var channel, connection;

app.use(express.json());

//Url to connect to db instance on cluster
mongoose.connect("mongodb://mongo:27017/product-service",{ useNewUrlParser: true, useUnifiedTopology: true,})
  .then(() => {
    console.log("Product Service DB connected");
  })
  .catch((err) => {
    console.log("ERROR : ", err);
  });


async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  //check if exists or create queue named product
  await channel.assertQueue("PRODUCT");
}
connect();

//buy a product
//User sends a list of product id's to buy
//Creating an order with those products and a total value of sum of product prices
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );
  channel.consume("PRODUCT", (data) => {
    console.log("Consuming product queue");
    order = JSON.parse(data.content);
    channel.ack(data);
  });
  return res.json(order);
});

//Create a new product
app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
  });
  newProduct.save();
  return res.json(newProduct);
});

app.listen(PORT, () => {
  console.log(`Product-Service at ${PORT}`);
});
