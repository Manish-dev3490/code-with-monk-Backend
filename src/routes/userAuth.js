const express = require('express');
const authRouter = express.Router();
const {signUpHandler,logInHandler,logOutHandler,registerAdminHandler} =require('../controllers/userAuthController');
const authValidation = require('../middlewares/auth');
const adminRegisterValidation = require('../middlewares/admin');


authRouter.post('/signup', signUpHandler);
authRouter.post('/login', logInHandler);
authRouter.post('/logout',authValidation, logOutHandler);
authRouter.post('/admin/register',adminRegisterValidation, registerAdminHandler);

// authRouter.get('/user/profile', userProfileHandler);

module.exports = authRouter;