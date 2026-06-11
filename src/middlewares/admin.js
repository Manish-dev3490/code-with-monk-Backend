const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const redisClient = require('../config/redisConnection');


const adminRegisterValidation = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("token is not present you need to login again");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        if(!payload)throw new Error("token is not valid");
        const user = await userModel.findById(payload._id);
        if (!user) throw new Error("user is not present in database");
        if(!payload.role==="admin")throw new error("invalid credentials");
        const isBlockedToken = await redisClient.exists(`token:${token}`);
        if (isBlockedToken) throw new Error("token is blocked please login again");
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send("Error : " + error)
    }
};

module.exports=adminRegisterValidation