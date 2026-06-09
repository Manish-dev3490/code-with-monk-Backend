const express = require('express');
const authRouter = express.Router();


authRouter.post('/signup', signUpHandler);
authRouter.post('/login', logInHandler);
authRouter.post('/logout', logOutHandler);
authRouter.get('/user/profile', userProfileHandler);

module.exports = authRouter;