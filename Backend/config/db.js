const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
    };
    await mongoose.connect(uri, options);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Failed to connect to database", error);
    process.exit(1);
  }
};

module.exports = connectDB;
