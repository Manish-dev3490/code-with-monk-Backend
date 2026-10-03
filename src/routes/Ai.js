const express = require('express');
const authValidation = require('../middlewares/auth');
const AiController = require('../controllers/Ai');
const AiRouter = express.Router();

AiRouter.post("/chat",authValidation,AiController)
module.exports=AiRouter;