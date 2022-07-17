const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");

//const HOST = process.env.MONGO_SERVICE_HOST;
//const MONGO_PORT = process.env.MONGO_SERVICE_PORT;
//const DB_NAME = "auth-service";
//const MONGO = `mongodb://${HOST}:${MONGO_PORT}/${DB_NAME}`;

//log err
mongoose.connect("mongodb://mongo:27017/auth-service", { useNewUrlParser: true, seUnifiedTopology: true, })
  .then(() => {
    console.log("Auth DB connected");
  })
  .catch((err) => {
    console.log("ERROR : ", err);
  });

app.use(express.json());

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User doesn't exist" });
  } else {
    if (password !== user.password) {
      return res.json({ message: "Password Incorrect" });
    }
    const payload = {
      email,
      name: user.name,
    };
    jwt.sign(payload, "secret", (err, token) => {
      if (err) console.log(err);
      else return res.json({ token: token });
    });
  }
});

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.json({ message: "User already exists" });
  } else {
    const newUser = new User({
      email,
      name,
      password,
    });
    newUser.save();
    return res.json(newUser);
  }
});

app.listen(PORT, () => {
  console.log(`Auth-Service at ${PORT}`);
});
