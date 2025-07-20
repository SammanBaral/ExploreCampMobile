import express from 'express';
import { PrismaClient } from '@prisma/client';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET availability for a product
router.get('/:productId', asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const availability = await prisma.availability.findMany({
        where: { productId: parseInt(productId), isBooked: false },
    });
    res.json(availability);
}));

// POST add available dates
router.post('/:productId/add', asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const { dates } = req.body; // expecting: array of ISO strings

    const records = dates.map(date => ({
        date: new Date(date),
        productId: parseInt(productId),
    }));

    const created = await prisma.availability.createMany({ data: records });
    res.json({ message: 'Availability added', count: created.count });
}));

// PATCH: mark a specific date as booked
router.patch('/:id/book', asyncWrapper(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.availability.update({
        where: { id: parseInt(id) },
        data: { isBooked: true },
    });

    res.json(updated);
}));

export default router;
