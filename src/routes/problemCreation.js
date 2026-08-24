const express=require('express');
const problemRouter=express.Router();
const {problemCreationMethod}=require('../controllers/problemCreationControllers');
const adminRegisterValidation = require('../middlewares/admin');


problemRouter.post("/create",adminRegisterValidation,problemCreationMethod)
// problemRouter.patch("/update/:id",problemUpdateMethod)
// problemRouter.delete("/delete/:id",problemDeleteMethod)


// problemRouter.get("/:id",fetchProblemByIdMethod);
// problemRouter.get("/user",fetchAllProblemdMethod);
// problemRouter.get("/user/:id",fetchProblemsSolvedByUserdMethod);

module.exports=problemRouter;

