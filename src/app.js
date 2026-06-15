const express = require('express');
require('dotenv').config({
    path: '../.env'
});
const connectToMONGODB = require('../src/config/mongoConnection')
const redisClient = require("./config/redisConnection")
const authRouter = require("./routes/userAuth")
const problemRouter = require("./routes/problemCreation")
const app = express();
const cookieParser = require("cookie-parser");

// some middlewares for upcoming requests
app.use(cookieParser());
app.use(express.json())



// listed all the routers
app.use("/user", authRouter)
app.use("/problem", problemRouter)




// function for initializing the db connection and server
async function initConnection() {
    connectToMONGODB().then(async (result) => {
        console.log("connected with mongodb cluster");

        await redisClient.connect();
        console.log("connected with redis");

        app.listen(process.env.PORT, () => {
            console.log("server is listening on ", process.env.PORT);

        });
    }).catch((err) => {
        console.log(err.message);
    });
}
initConnection()


