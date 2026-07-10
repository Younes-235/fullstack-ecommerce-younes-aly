require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', authRoutes);
app.use('/api', cartRoutes);

app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Express e-commerce server is running on port ${PORT}`);
})