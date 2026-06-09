const express = require('express');
const authRouter = express.Router();
const authHandler =require('../controllers/userAuthController')


authRouter.post('/signup', authHandler.signUpHandler);
authRouter.post('/login', authHandler.logInHandler);
authRouter.post('/logout', authHandler.logOutHandler);
authRouter.get('/user/profile', userProfileHandler);

module.exports = authRouter;