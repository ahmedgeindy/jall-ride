const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./routes/auth');
const carsRoutes      = require('./routes/cars');
const bookingRoutes   = require('./routes/bookings');
const driversRoutes   = require('./routes/drivers');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler    = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth',      authRoutes);
app.use('/cars',      carsRoutes);
app.use('/bookings',  bookingRoutes);
app.use('/drivers',   driversRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(errorHandler);

module.exports = app;
