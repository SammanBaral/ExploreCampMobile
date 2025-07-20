import { PrismaClient } from '@prisma/client';
import express from 'express';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authenticateUser from '../middlewares/authenticateUser.js';
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateUser);

router.post('/create', asyncWrapper(async (req, res) => {
  const { title, description, coverImage } = req.body;
  const userId = req.user.id;

  const collection = await prisma.collection.create({
    data: { title, description, coverImage, userId }
  });

  res.json(collection);
}));

router.post('/addSpot', asyncWrapper(async (req, res) => {
  const { collectionId, productId } = req.body;

  const savedSpot = await prisma.savedSpot.create({
    data: {
      collectionId: parseInt(collectionId),
      productId: parseInt(productId),
    }
  });

  res.json(savedSpot);
}));

router.get('/user', asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  let collections = await prisma.collection.findMany({
    where: { userId },
    include: { savedSpots: { include: { product: true } } }
  });
  // Add spots array for frontend compatibility
  collections = collections.map(col => ({
    ...col,
    spots: col.savedSpots.map(s => s.product)
  }));
  res.json(collections);
}));

export default router;
