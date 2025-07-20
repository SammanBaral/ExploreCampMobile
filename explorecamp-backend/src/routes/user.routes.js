import { PrismaClient } from '@prisma/client';
import express from 'express';
import nodemailer from 'nodemailer';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import { uploadSingle } from '../middlewares/upload.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import generateToken from '../utils/token.js';
import { registerUserSchema } from '../validations/userValidation.js';

// In-memory OTP store (for demo)
const otpStore = {};

// Configure nodemailer (for demo, use ethereal)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
    },
});

const router = express.Router();
const prisma = new PrismaClient();
router.use(express.json());
router.post('/register', asyncWrapper(async (req, res) => {
    const result = registerUserSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
    }

    const validatedData = result.data;

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await prisma.user.create({
        data: {
            email: validatedData.email,
            name: validatedData.name,
            bio: validatedData.bio,
            location: validatedData.location,
            password: hashedPassword,
        },
    });

    res.json(newUser);
}));


router.get('/getAllUsers', asyncWrapper(async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, bio: true, location: true, createdAt: true, isAdmin: true },
    });
    res.json(users);
}));

router.get('/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, email: true, name: true, bio: true, location: true, createdAt: true },

    })
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);

}));

router.post('/login', asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email: email },

    });
    if (!user) {
        return res.status(404).json({ error: 'Invalid email' });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });

    }
    const token = generateToken(user.id);
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            location: user.location,
            isAdmin: user.isAdmin,
        }
    });
}))

router.put('/update/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const { name, bio, location, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    let updatedData = { name, bio, location };

    if (currentPassword && newPassword) {
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        const hashedNewPassword = await hashPassword(newPassword);
        updatedData.password = hashedNewPassword;
    }

    const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updatedData,
    });

    res.json({ message: 'User updated', user: updatedUser });
}));

// Get full user profile
router.get('/profile/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            location: true,
            phone: true,
            profileImage: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            notificationSettings: true,
            createdAt: true,
            isAdmin: true
        }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
}));

// Update profile fields
router.put('/profile/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const { name, bio, location, phone } = req.body;
    const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { name, bio, location, phone }
    });
    res.json({ message: 'Profile updated', user });
}));

// Update contact details
router.put('/contact/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const { phone, emergencyContactName, emergencyContactPhone } = req.body;
    const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { phone, emergencyContactName, emergencyContactPhone }
    });
    res.json({ message: 'Contact details updated', user });
}));

// Update notification settings
router.put('/notifications/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const { notificationSettings } = req.body;
    const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { notificationSettings }
    });
    res.json({ message: 'Notification settings updated', user });
}));

// Upload/change profile image
router.post('/profile-image/:id', uploadSingle, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const imagePath = req.file.filename; // Only store the filename
    const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { profileImage: imagePath }
    });
    res.json({ message: 'Profile image updated', profileImage: imagePath, user });
}));

// Get current authenticated user profile
router.get('/me', authenticateUser, asyncWrapper(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            location: true,
            phone: true,
            profileImage: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            notificationSettings: true,
            createdAt: true,
            isAdmin: true
        }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
}));

// Request OTP endpoint
router.post('/auth/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    // Send email
    try {
        await transporter.sendMail({
            from: 'no-reply@explorecamp.com',
            to: email,
            subject: 'Your ExploreCamp OTP',
            text: `Your OTP is: ${otp}`,
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP endpoint
router.post('/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
    const record = otpStore[email];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({ data: { email, password: '', name: '', isAdmin: false } });
    }
    // Clean up OTP
    delete otpStore[email];
    // Return user data (simulate login)
    res.json({ success: true, user });
});

export default router;