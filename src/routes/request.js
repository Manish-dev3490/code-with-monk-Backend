const express = require("express");
const authValidation = require("../middlewares/auth");
const { sentRequestController, sentRequestController2, reviewRequestController, reviewRequestController2 } = require("../controllers/request");
const requestRouter = express.Router();



requestRouter.post("/sent/interested/:toUserId", authValidation, sentRequestController);
requestRouter.post("/sent/ignored/:toUserId", authValidation, sentRequestController2);


requestRouter.post("/review/:status/:requestId", authValidation, reviewRequestController)


module.exports = requestRouter;