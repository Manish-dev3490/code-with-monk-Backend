const express = require('express');
const authRouter = express.Router();
const {signUpHandler,logInHandler,logOutHandler} =require('../controllers/userAuthController');
const authValidation = require('../middlewares/auth');


authRouter.post('/signup', signUpHandler);
authRouter.post('/login', logInHandler);
authRouter.post('/logout',authValidation, logOutHandler);
// authRouter.get('/user/profile', userProfileHandler);

module.exports = authRouter;