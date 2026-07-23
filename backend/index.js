require('dotenv').config();

const app = require("./app.js");
const connectMongoDB = require('./config/mongoDb.js');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`🚀 Express e-commerce server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('💥 Failed to connect to MongoDB:', err);
  }
};

startServer();