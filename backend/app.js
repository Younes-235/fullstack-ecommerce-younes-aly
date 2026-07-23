const express = require('express');
const cors = require('cors');
const path = require('path'); 
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRouter = require('./routes/userRoutes');
const statsRoutes = require('./routes/stats');
const activityLogRoutes = require('./routes/activityLogRoute'); 
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', authRoutes);
app.use('/api', cartRoutes);
app.use('/api/users', userRouter);
app.use('/api/admin', statsRoutes);
app.use('/api/logs', activityLogRoutes); 

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;