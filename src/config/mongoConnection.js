const mongoose = require('mongoose');




async function connectToMongoDB() {
    
    await mongoose.connect(process.env.MONGO_URL);
}

module.exports = connectToMongoDB;