import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import adminRouter from './routes/admin.routes.js';
import availabilityRouter from './routes/availability.routes.js';
import bookingRouter from './routes/booking.routes.js';
import collectionRouter from './routes/collection.routes.js';
import homeRouter from './routes/home.routes.js';
import productRouter from './routes/product.routes.js';
import reviewRouter from './routes/review.routes.js';
import userRouter from './routes/user.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('ExploreCamp API is running!');
});

app.use('/', homeRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/availability', availabilityRouter);
app.use('/bookings', bookingRouter);
app.use('/reviews', reviewRouter);
app.use('/collections', collectionRouter);
app.use('/admin', adminRouter);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
