// database.js
const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected");
    } catch (err) {
        console.log("❌ Database connection failed");
        console.error(err);
        process.exit(1); // exit the process if DB fails
    }
}
