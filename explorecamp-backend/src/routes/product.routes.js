import { PrismaClient } from '@prisma/client';
import express from 'express';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import { uploadMultiple } from '../middlewares/upload.js';


const router = express.Router();
const prisma = new PrismaClient();
router.use(express.json());


router.post('/add', uploadMultiple, asyncWrapper(async (req, res) => {
    const {
        name,
        location,
        about,
        pricePerNight,
        amenities,
        latitude,
        longitude,
        ownerId
    } = req.body;

    const parsedAmenities = JSON.parse(amenities);

    const imageFilenames = req.files.map(file => file.filename);

    const newProduct = await prisma.product.create({
        data: {
            name,
            location,
            about,
            pricePerNight: parseFloat(pricePerNight),
            amenities: parsedAmenities,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            ownerId: parseInt(ownerId),
            images: imageFilenames,
        },
    });

    res.json(newProduct);
}));


router.get('/getAllProducts', asyncWrapper(async (req, res) => {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, location: true, about: true, pricePerNight: true, amenities: true, latitude: true, longitude: true, ownerId: true, images: true },
    });
    res.json(products);
}));

// Get individual product by ID
router.get('/:id', asyncWrapper(async (req, res) => {
    console.log('DEBUG: GET /products/:id called with id:', req.params.id);
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: {
            id: true,
            name: true,
            location: true,
            about: true,
            pricePerNight: true,
            amenities: true,
            latitude: true,
            longitude: true,
            ownerId: true,
            images: true,
            rating: true,
            checkInTime: true,
            checkOutTime: true
        },
    });

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
}));


router.put('/update/:id', authenticateUser, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { name, location, about, pricePerNight, amenities, latitude, longitude } = req.body;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
    });

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    if (product.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to update this product' });
    }

    const updated = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { name, location, about, pricePerNight, amenities, latitude, longitude },
    });

    res.json(updated);
}));

// Search products with filters
router.post('/search', asyncWrapper(async (req, res) => {
    const {
        location,
        dates, // { from, to }
        guests,
        price,
        amenities,
        type,
        bookingOptions,
        rating
    } = req.body;

    // Build Prisma where clause
    const where = {};
    if (location) {
        where.location = { contains: location, mode: 'insensitive' };
    }
    if (price && (price.min || price.max)) {
        where.pricePerNight = {};
        if (price.min) where.pricePerNight.gte = price.min;
        if (price.max) where.pricePerNight.lte = price.max;
    }
    if (Array.isArray(amenities) && amenities.length > 0) {
        where.amenities = { hasEvery: amenities };
    }
    if (Array.isArray(type) && type.length > 0) {
        where.OR = type.map(t => ({ name: { contains: t, mode: 'insensitive' } }));
    }
    if (rating) {
        where.rating = { gte: rating };
    }
    if (bookingOptions && bookingOptions.instantBook) {
        where.isAvailable = true;
    }
    if (bookingOptions && bookingOptions.freeCancellation) {
        where.freeCancellation = true;
    }
    if (guests) {
        where.maxGuests = { gte: guests };
    }
    // Fetch products with availability and reviews relation
    const products = await prisma.product.findMany({
        where,
        include: {
            availability: true,
            reviews: true
        }
    });
    // Date filtering (in-memory)
    let filtered = products;
    if (dates && dates.from && dates.to) {
        const fromDate = new Date(dates.from);
        const toDate = new Date(dates.to);
        // Get all dates in range
        const days = [];
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        filtered = products.filter(product => {
            const availableDates = product.availability.filter(a => !a.isBooked).map(a => a.date.toISOString().slice(0, 10));
            return days.every(day => availableDates.includes(day.toISOString().slice(0, 10)));
        });
    }
    // Remove availability from response for brevity
    filtered = filtered.map(({ availability, ...rest }) => rest);
    res.json(filtered);
}));

export default router;