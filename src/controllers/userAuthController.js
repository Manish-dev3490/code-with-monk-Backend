const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const validateMethods = require("../utils/validationData");
const redisClient = require("../config/redisConnection");

// controller for signUp route
const signUpHandler = async (req, res) => {
  try {
    validateMethods.validateSignUpApi(req.body);

    const { password, emailId } = req.body;

    const existingUser = await userModel.findOne({ emailId });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    req.body.password = hashPassword;
    req.body.role = "user";
    const newUser = await userModel.create(req.body);

    const token = jwt.sign(
      {
        emailId,
        _id: newUser._id,
        role: "user",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
};
// controller for logIn route
const logInHandler = async (req, res) => {
  try {
    validateMethods.validateLoginApi(req);
    const { emailId, password } = req.body;
    // check user exist
    const user = await userModel.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    } else {
      const token = jwt.sign(
        {
          emailId,
          _id: user._id,
          role: "user",
        },
        process.env.JWT_KEY,
        {
          expiresIn: "3d",
        },
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      });
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(401).send("Error : " + error);
  }
};
// controller for logOut route
const logOutHandler = async (req, res) => {
  const { token } = req.cookies;
  const payload = jwt.decode(token);
  await redisClient.set(`token:${token}`, "blocked");
  await redisClient.expireAt(`token:${token}`, payload.exp);
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logged out successfully");
};

// logic to register admin
const registerAdminHandler = async (req, res) => {
  try {
    if(req.user.role==="user")throw new error("invalid credentials");
    validateMethods.validateSignUpApi(req.body);

    const { password, emailId } = req.body;

    const existingUser = await userModel.findOne({ emailId });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    req.body.password = hashPassword;
    req.body.role = "admin";
    const newUser = await userModel.create(req.body);

    const token = jwt.sign(
      {
        emailId,
        _id: newUser._id,
        role: "admin",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(400).send("Error : " + error);
  }
};

module.exports = {
  signUpHandler,
  logInHandler,
  logOutHandler,
  registerAdminHandler,
};
