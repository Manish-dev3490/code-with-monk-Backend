const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const validateMethods = require("../utils/validationData");
const redisClient = require("../config/redisConnection");
const { submissionModel } = require("../models/submission");

// controller for signUp route

const signUpHandler = async (req, res) => {
  try {
    validateMethods.validateSignUpApi(req.body);

    const { password, emailId } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await userModel.create({
      ...req.body,
      password: hashPassword,
      role: "user",
    });

    // Generate JWT
    const token = jwt.sign(
      {
        emailId: newUser.emailId,
        _id: newUser._id,
        role: "user",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "3d",
      }
    );

    // Check environment
    const isProduction =
      process.env.NODE_ENV === "production";

    // Set JWT cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Remove password from response
    const userData = newUser.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "User created successfully",
      data: userData,
    });

  } catch (error) {
    console.error("Signup Error:", error.message);

    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for logIn route

const logInHandler = async (req, res) => {
  try {
    validateMethods.validateLoginApi(req);

    const { emailId, password } = req.body;

    // Check user exists
    const user = await userModel.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        emailId: user.emailId,
        _id: user._id,
        role: user.role || "user",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "3d",
      }
    );

    const isProduction =
      process.env.NODE_ENV === "production";

    // Set authentication cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Do not send password hash
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "You are logged in successfully",
      data: userData,
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
};

// controller for logOut route
const logOutHandler = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);
    await redisClient.set(`token:${token}`, "blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).send("logged out successfully");
  }
  catch (error) {
    res.status(404).send("Error : " + error)
  }
};

// logic to register admin

const registerAdminHandler = async (req, res) => {
  try {
    // Only existing admins can register a new admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Validate request
    validateMethods.validateSignUpApi(req.body);

    const { password, emailId } = req.body;

    // Check if email already exists
    const existingUser = await userModel.findOne({ emailId });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newUser = await userModel.create({
      ...req.body,
      password: hashPassword,
      role: "admin",
    });

    // Generate JWT
    const token = jwt.sign(
      {
        emailId: newUser.emailId,
        _id: newUser._id,
        role: "admin",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "3d",
      }
    );

    // Environment-based cookie configuration
    const isProduction =
      process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Remove password before sending response
    const adminData = newUser.toObject();
    delete adminData.password;

    return res.status(201).json({
      message: "Admin created successfully",
      data: adminData,
    });

  } catch (error) {
    console.error("Admin Registration Error:", error.message);

    return res.status(400).json({
      message: error.message,
    });
  }
};


// controller for delete profile 
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await userModel.findByIdAndDelete(userId);
    await submissionModel.deleteMany({ userId });
    res.status(200).send("your profile is deleted successfully");
  }

  catch (error) {
    res.status(400).send("error occured");
  }
}

// controller for fetch profile 
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "your profile is fetched successfully", profile: user
    });
  }

  catch (error) {
    res.status(400).send("error occured");
  }
}
module.exports = {
  signUpHandler,
  logInHandler,
  logOutHandler,
  registerAdminHandler,
  deleteProfile,
  getProfile
};
