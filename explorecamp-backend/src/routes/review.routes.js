import { PrismaClient } from '@prisma/client';
import express from 'express';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateUser);

router.post('/add', asyncWrapper(async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    console.log('Adding review:', { productId, rating, comment, userId });

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if product exists before creating review
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: parseInt(productId),
        rating: parseInt(rating),
        comment,
      }
    });

    console.log('Review created:', review);
    res.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message || 'Failed to create review' });
  }
}));

router.get('/product/:productId', asyncWrapper(async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch reviews' });
  }
}));

// Get all reviews by the current authenticated user
router.get('/user', asyncWrapper(async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user reviews' });
  }
}));

export default router;
