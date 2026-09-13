const express = require('express');
const problemRouter = express.Router();
const { problemCreationMethod, problemUpdationMethod, problemDeletionMethod, getProblemMethod, fetchProblemsSolvedByUserdMethod,getAllProblemMethod } = require('../controllers/problemCreationControllers');
const adminRegisterValidation = require('../middlewares/admin');
const authValidation = require('../middlewares/auth');


problemRouter.post("/create", adminRegisterValidation, problemCreationMethod)
problemRouter.put("/update/:_id", adminRegisterValidation, problemUpdationMethod)
problemRouter.delete("/delete/:_id", adminRegisterValidation, problemDeletionMethod)

problemRouter.get("/problemSolvedByUser", authValidation, fetchProblemsSolvedByUserdMethod);
problemRouter.get("/user",authValidation,getAllProblemMethod);
problemRouter.get("/:_id", authValidation, getProblemMethod);

module.exports = problemRouter;

