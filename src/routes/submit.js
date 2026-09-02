const express=require("express");
const authValidation = require("../middlewares/auth");
const { codeSubmitController, codeRunController } = require("../controllers/submitControllers");
const submitRouter=express.Router();


submitRouter.post("/submit/:_id",authValidation,codeSubmitController);
submitRouter.post("/run/:_id",authValidation,codeRunController);


module.exports={submitRouter}