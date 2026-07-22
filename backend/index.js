require('dotenv').config();

const app = require("./app.js");
const connectMongoDB = require('./config/mongoDb.js');

const PORT = process.env.PORT;
connectMongoDB();
app.listen(PORT, () => {
    console.log(`Express e-commerce server is running on port ${PORT}`);
})