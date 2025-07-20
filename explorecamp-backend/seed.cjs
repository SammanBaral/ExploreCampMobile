// Prisma seed script for demo data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

async function main() {
    // Clear existing data
    await prisma.trending.deleteMany();
    await prisma.savedSpot.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@demo.com',
            password: await bcrypt.hash('adminpass', SALT_ROUNDS),
            name: 'Admin User',
            isAdmin: true,
            phone: '1234567890',
            profileImage: null,
        },
    });
    const user = await prisma.user.create({
        data: {
            email: 'user@demo.com',
            password: await bcrypt.hash('userpass', SALT_ROUNDS),
            name: 'Demo User',
            isAdmin: false,
            phone: '0987654321',
            profileImage: null,
        },
    });

    // Create products (campsites)
    const campsitesImages = [
        'campsites/qfbtoefcw0vk67iualva.webp',
        'campsites/the-15-most-beautiful-campsites-in-the-us-169272.jpg',
        'campsites/wasdale-campsite-1518300-tent-person-dog.jpg'
    ];
    const productData = [
        {
            name: 'Mountain View Camp',
            location: 'Nagarkot',
            about: 'A beautiful campsite with mountain views and hiking trails nearby. Perfect for tent camping and stargazing.',
            pricePerNight: 2500, // NPR
            images: campsitesImages,
            amenities: ['Firepit', 'Water', 'Restroom', 'Hiking', 'Parking On Site'],
            latitude: 27.7172,
            longitude: 85.3240,
            ownerId: admin.id,
        },
        {
            name: 'Lakefront Retreat',
            location: 'Phewa Lake',
            about: 'Camp by the serene lake. Great for fishing, kayaking, and family getaways. Cabins and RV sites available.',
            pricePerNight: 2200, // NPR
            images: campsitesImages,
            amenities: ['Dock', 'Kayak', 'Electricity', 'Fishing', 'Cabins', 'WiFi'],
            latitude: 28.2096,
            longitude: 83.9856,
            ownerId: admin.id,
        },
        {
            name: 'Desert Oasis',
            location: 'Bardiya',
            about: 'Experience the night sky. Glamping tents, firepits, and water activities available.',
            pricePerNight: 1800, // NPR
            images: campsitesImages,
            amenities: ['Shade', 'Water', 'Restroom', 'Glamping', 'Water Activities'],
            latitude: 28.2500,
            longitude: 81.3333,
            ownerId: admin.id,
        },
        {
            name: 'Forest Hideaway',
            location: 'Shivapuri National Park',
            about: 'Secluded forest camping among the trees. Hiking, biking, and wildlife watching.',
            pricePerNight: 2000, // NPR
            images: ['hero-mountain-autumn.jpg'],
            amenities: ['Hiking', 'Biking Trails', 'Showers', 'Potable Water', 'Tent Camping'],
            latitude: 27.8106,
            longitude: 85.3636,
            ownerId: admin.id,
        },
        {
            name: 'Coastal Breeze Camp',
            location: 'Chitwan',
            about: 'Wake up to river views and fresh air. RV sites, tent camping, and camp store on site.',
            pricePerNight: 2100, // NPR
            images: ['placeholder.svg'],
            amenities: ['RV Sites', 'Camp Store', 'Toilets', 'Electricity', 'WiFi'],
            latitude: 27.5291,
            longitude: 84.3542,
            ownerId: admin.id,
        },
    ];
    for (const data of productData) {
        await prisma.product.create({ data });
    }
    // Fetch products for relations
    const allProducts = await prisma.product.findMany();
    // Add availability for next 30 days for each product
    const today = new Date();
    for (const product of allProducts) {
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            await prisma.availability.create({
                data: {
                    date,
                    isBooked: false,
                    productId: product.id,
                },
            });
        }
    }

    // Create bookings
    await prisma.booking.create({
        data: {
            userId: user.id,
            productId: allProducts[0].id,
            checkIn: new Date(),
            checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            guestName: 'Demo User',
            guestEmail: 'user@demo.com',
            guestPhone: '0987654321',
            totalPrice: 240,
            paymentMethod: 'Credit Card',
            status: 'confirmed',
        },
    });

    // Create reviews
    await prisma.review.create({
        data: {
            rating: 5,
            comment: 'Amazing experience!',
            productId: allProducts[0].id,
            userId: user.id,
        },
    });

    // Create trending
    await prisma.trending.create({
        data: {
            productId: allProducts[0].id,
            order: 1,
        },
    });
    await prisma.trending.create({
        data: {
            productId: allProducts[1].id,
            order: 2,
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 