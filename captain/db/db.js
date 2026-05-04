const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.log("❌ Error connecting to Database", error);
        process.exit(1);
    }
}

module.exports = connect;