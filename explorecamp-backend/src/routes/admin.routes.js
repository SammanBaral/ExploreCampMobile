import { PrismaClient } from '@prisma/client';
import express from 'express';
import nodemailer from 'nodemailer';
import { emailConfig } from '../../email-config.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import isAdmin from '../middlewares/isAdmin.js';
import { uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateUser, isAdmin);

// Debug middleware to log all admin requests
router.use((req, res, next) => {
    console.log(`[ADMIN] ${req.method} ${req.path} - User: ${req.user?.email} (Admin: ${req.user?.isAdmin})`);
    next();
});

// Products
router.get('/products', async (req, res) => {
    try {
        console.log('[ADMIN] Fetching all products');
        const products = await prisma.product.findMany();
        console.log(`[ADMIN] Found ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('[ADMIN] Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get individual product
router.get('/products/:id', async (req, res) => {
    try {
        console.log(`[ADMIN] Fetching product with ID: ${req.params.id}`);
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!product) {
            console.log(`[ADMIN] Product not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(`[ADMIN] Found product: ${product.name}`);
        res.json(product);
    } catch (error) {
        console.error('[ADMIN] Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/products', uploadMultiple, async (req, res) => {
    try {
        const {
            name,
            location,
            about,
            pricePerNight,
            amenities,
            latitude,
            longitude,
            ownerId,
            checkInTime,
            checkOutTime
        } = req.body;

        const parsedAmenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities || '[]');
        const imageFilenames = req.files ? req.files.map(file => file.filename) : [];

        const product = await prisma.product.create({
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
                checkInTime: checkInTime || "2:00 PM",
                checkOutTime: checkOutTime || "11:00 AM",
            }
        });
        res.json(product);
    } catch (error) {
        console.error('[ADMIN] Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json(product);
    } catch (error) {
        console.error('[ADMIN] Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('[ADMIN] Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Add available dates for a product
router.post('/products/:id/availability', async (req, res) => {
    const { id } = req.params;
    const { dates } = req.body; // dates should be an array of date strings

    try {
        const availabilityRecords = await Promise.all(
            dates.map(date =>
                prisma.availability.create({
                    data: {
                        date: new Date(date),
                        productId: parseInt(id),
                        isBooked: false
                    }
                })
            )
        );
        res.json({ success: true, availability: availabilityRecords });
    } catch (error) {
        console.error('[ADMIN] Error adding availability:', error);
        res.status(400).json({ error: error.message });
    }
});

// Users
router.get('/users', async (req, res) => {
    try {
        console.log('[ADMIN] Fetching all users');
        const users = await prisma.user.findMany();
        console.log(`[ADMIN] Found ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('[ADMIN] Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json(user);
    } catch (error) {
        console.error('[ADMIN] Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Add new user (admin)
router.post('/users', async (req, res) => {
    try {
        console.log('[ADMIN] Creating new user:', req.body);
        const { name, email, password, location, isAdmin } = req.body;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // In production, this should be hashed
                location,
                isAdmin: isAdmin || false
            }
        });
        
        console.log(`[ADMIN] Successfully created user: ${user.email}`);
        res.json(user);
    } catch (error) {
        console.error('[ADMIN] Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete user (admin) - includes their bookings and collections
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        console.log(`[ADMIN] Deleting user with ID: ${userId}`);
        
        // First, check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`[ADMIN] Found user to delete: ${user.email}`);
        
        // Delete user's bookings first (due to foreign key constraints)
        const deletedBookings = await prisma.booking.deleteMany({
            where: { userId: userId }
        });
        console.log(`[ADMIN] Deleted ${deletedBookings.count} bookings for user ${userId}`);
        
        // Delete user's collections if they exist
        try {
            const deletedCollections = await prisma.collection.deleteMany({
                where: { userId: userId }
            });
            console.log(`[ADMIN] Deleted ${deletedCollections.count} collections for user ${userId}`);
        } catch (collectionError) {
            console.log('[ADMIN] No collections table or no collections to delete');
        }
        
        // Finally, delete the user
        await prisma.user.delete({
            where: { id: userId }
        });
        
        console.log(`[ADMIN] Successfully deleted user ${userId} and all related data`);
        res.json({ success: true, message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error('[ADMIN] Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Trending persistence in DB
router.get('/trending', async (req, res) => {
    try {
        const trending = await prisma.trending.findMany({
            orderBy: { order: 'asc' },
            select: { productId: true }
        });
        const trendingProductIds = trending.map(t => t.productId);
        res.json(trendingProductIds);
    } catch (error) {
        console.error('[ADMIN] Error fetching trending products:', error);
        res.status(500).json({ error: 'Failed to fetch trending products' });
    }
});

router.post('/trending', async (req, res) => {
    const trendingIds = req.body.trendingIds || [];
    try {
        // Remove all existing trending rows
        await prisma.trending.deleteMany({});
        // Insert new trending rows with order
        await prisma.$transaction(
            trendingIds.map((productId, idx) =>
                prisma.trending.create({ data: { productId, order: idx } })
            )
        );
        res.json({ success: true });
    } catch (error) {
        console.error('[ADMIN] Error updating trending products:', error);
        res.status(500).json({ error: 'Failed to update trending products' });
    }
});

// Stats
router.get('/stats', async (req, res) => {
    try {
        console.log('[ADMIN] Fetching stats');
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        const bookingCount = await prisma.booking.count();
        console.log(`[ADMIN] Stats - Users: ${userCount}, Products: ${productCount}, Bookings: ${bookingCount}`);
        res.json({ userCount, productCount, bookingCount });
    } catch (error) {
        console.error('[ADMIN] Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// List all bookings (admin)
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true, location: true, images: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Update booking status (admin)
router.put('/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`[ADMIN] Updating booking ${id} to status: ${status}`);

    try {
        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { user: true, product: true }
        });

        console.log(`[ADMIN] Successfully updated booking ${id} to ${status}`);

        // Send email if confirmed
        if (status === 'confirmed') {
            console.log(`[ADMIN] Attempting to send confirmation email for booking ${id}`);

            try {
                // Try the primary Gmail configuration
                let transporter = nodemailer.createTransport(emailConfig);

                // Test the connection
                await transporter.verify();
                console.log('[ADMIN] ✅ Email configuration verified successfully');

                const emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2d3748; text-align: center;">🎉 Your Booking is Confirmed!</h2>
                        
                        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4a5568; margin-top: 0;">Booking Details</h3>
                            <p><strong>Campsite:</strong> ${booking.product.name}</p>
                            <p><strong>Location:</strong> ${booking.product.location}</p>
                            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.product.checkInTime}</p>
                            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.product.checkOutTime}</p>
                            <p><strong>Total Amount:</strong> $${booking.totalPrice}</p>
                            <p><strong>Guest:</strong> ${booking.guestName}</p>
                        </div>
                        
                        <div style="background-color: #e6fffa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #234e52; margin-top: 0;">📋 Important Information</h4>
                            <ul style="color: #2d3748;">
                                <li>Please arrive at the specified check-in time</li>
                                <li>Bring your booking confirmation with you</li>
                                <li>Contact the campsite if you need to make changes</li>
                                <li>Cancellation charges apply (10% of total price)</li>
                            </ul>
                        </div>
                        
                        <p style="text-align: center; color: #718096; font-size: 14px;">
                            Thank you for choosing ExploreCamp!<br>
                            Have a wonderful camping experience! 🌲⛺
                        </p>
                    </div>
                `;

                const info = await transporter.sendMail({
                    from: '"ExploreCamp" <abfghdioe.acc@gmail.com>',
                    to: booking.user.email,
                    subject: '🎉 Your ExploreCamp Booking is Confirmed!',
                    html: emailContent,
                    text: `
                        Hi ${booking.user.name},
                        
                        Your booking at ${booking.product.name} is now confirmed!
                        
                        Booking Details:
                        - Campsite: ${booking.product.name}
                        - Location: ${booking.product.location}
                        - Check-in: ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.product.checkInTime}
                        - Check-out: ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.product.checkOutTime}
                        - Total Amount: $${booking.totalPrice}
                        - Guest: ${booking.guestName}
                        
                        Important Information:
                        - Please arrive at the specified check-in time
                        - Bring your booking confirmation with you
                        - Contact the campsite if you need to make changes
                        - Cancellation charges apply (10% of total price)
                        
                        Thank you for choosing ExploreCamp!
                        Have a wonderful camping experience!
                    `
                });

                console.log(`[ADMIN] ✅ Real confirmation email sent to ${booking.user.email}`);
                console.log(`[ADMIN] 📧 Email Message ID: ${info.messageId}`);

            } catch (emailError) {
                console.error('[ADMIN] ❌ Error sending confirmation email:', emailError);
                console.log('[ADMIN] ⚠️ Continuing with booking update despite email failure');
                // Don't fail the request if email fails
            }
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error('[ADMIN] Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

export default router; 