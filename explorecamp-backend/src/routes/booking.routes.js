import { PrismaClient } from '@prisma/client';
import express from 'express';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create a new booking
router.post('/create', authenticateUser, asyncWrapper(async (req, res) => {
  const {
    productId,
    checkIn,
    checkOut,
    guestName,
    guestEmail,
    guestPhone,
    specialRequest,
    totalPrice,
    paymentMethod
  } = req.body;

  // Validate required fields
  if (!productId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) }
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check if dates are available
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Get availability for the date range
  const availability = await prisma.availability.findMany({
    where: {
      productId: parseInt(productId),
      date: {
        gte: checkInDate,
        lte: checkOutDate
      }
    }
  });

  // Check if all dates are available and not booked
  const unavailableDates = availability.filter(a => a.isBooked);
  if (unavailableDates.length > 0) {
    return res.status(400).json({ error: 'Selected dates are not available' });
  }

  // Create the booking with pending status
  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      productId: parseInt(productId),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      specialRequest,
      totalPrice: parseFloat(totalPrice),
      paymentMethod,
      status: 'pending' // Changed from 'confirmed' to 'pending'
    }
  });

  // Mark the dates as booked
  await prisma.availability.updateMany({
    where: {
      productId: parseInt(productId),
      date: {
        gte: checkInDate,
        lte: checkOutDate
      }
    },
    data: {
      isBooked: true
    }
  });

  res.json({ success: true, booking });
}));

// Get user's bookings
router.get('/user', authenticateUser, asyncWrapper(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId: req.user.id
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          location: true,
          images: true,
          pricePerNight: true,
          checkInTime: true,
          checkOutTime: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(bookings);
}));

// Cancel a booking
router.put('/:id/cancel', authenticateUser, asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findFirst({
    where: {
      id: parseInt(id),
      userId: req.user.id
    },
    include: {
      product: true
    }
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Only allow cancellation of confirmed bookings
  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      error: booking.status === 'pending'
        ? 'Cannot cancel pending bookings. Please wait for admin confirmation.'
        : 'This booking cannot be cancelled.'
    });
  }

  // Calculate cancellation charge (10% of total price)
  const cancellationCharge = Math.round(booking.totalPrice * 0.1);
  const refundAmount = booking.totalPrice - cancellationCharge;

  // Update booking status to cancelled
  await prisma.booking.update({
    where: { id: parseInt(id) },
    data: {
      status: 'cancelled',
      cancellationCharge: cancellationCharge,
      refundAmount: refundAmount
    }
  });

  // Mark the dates as available again
  await prisma.availability.updateMany({
    where: {
      productId: booking.productId,
      date: {
        gte: booking.checkIn,
        lte: booking.checkOut
      }
    },
    data: {
      isBooked: false
    }
  });

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    cancellationCharge,
    refundAmount,
    totalPaid: booking.totalPrice
  });
}));

// Get booking by ID
router.get('/:id', authenticateUser, asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findFirst({
    where: {
      id: parseInt(id),
      userId: req.user.id
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          location: true,
          images: true,
          pricePerNight: true,
          checkInTime: true,
          checkOutTime: true
        }
      }
    }
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json(booking);
}));

export default router;
