const express=require('express');
const problemRouter=express.Router();


problemRouter.post("/create",problemCreationMethod)
problemRouter.patch("/update/:id",problemUpdateMethod)
problemRouter.delete("/delete/:id",problemDeleteMethod)


problemRouter.get("/:id",fetchProblemByIdMethod);
problemRouter.get("/user",fetchAllProblemdMethod);
problemRouter.get("/user/:id",fetchProblemsSolvedByUserdMethod);

module.exports=problemRouter;

