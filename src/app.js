const express = require('express');
require('dotenv').config({
    path: '../.env'
});
const connectToMONGODB = require('../src/config/mongoConnection')


const app = express();

connectToMONGODB().then((result) => {
    console.log("connected with mongodb cluster");
    app.listen(process.env.PORT, () => {
        console.log("server is listening on ", process.env.PORT);

    });
}).catch((err) => {
    console.log(err.message);
});


