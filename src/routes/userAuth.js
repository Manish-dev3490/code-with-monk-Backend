const express = require("express");
const authRouter = express.Router();
const {
    signUpHandler,
    logInHandler,
    logOutHandler,
    registerAdminHandler,
    getProfile,
} = require("../controllers/userAuthController");
const authValidation = require("../middlewares/auth");
const adminRegisterValidation = require("../middlewares/admin");

authRouter.post("/signup", signUpHandler);
authRouter.post("/login", logInHandler);
authRouter.post("/logout", authValidation, logOutHandler);
authRouter.post(
    "/admin/register",
    adminRegisterValidation,
    registerAdminHandler,
);
authRouter.get("/profile", authValidation, getProfile);
authRouter.get("/checkAuth", authValidation, (req, res) => {
    try {
        const user = req.user;
        const reply = {
            _id: user._id,
            firstName: user.firstName,
            emailId: user.emailId,
            problemSolved: user.problemSolved
        };

        res.status(200).json({
            data: reply,
            message: "you are already authenticated"
        })
    } catch (error) {
        res.status(500).send("Error : ",error.message);
    }
});

module.exports = authRouter;
