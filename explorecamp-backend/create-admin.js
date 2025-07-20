import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if admin user exists
        const existingAdmin = await prisma.user.findFirst({
            where: { isAdmin: true }
        });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@explorecamp.com',
                password: hashedPassword,
                name: 'Admin User',
                location: 'Admin Location',
                isAdmin: true
            }
        });

        console.log('Admin user created successfully:', adminUser.email);
        console.log('Login credentials:');
        console.log('Email: admin@explorecamp.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser(); 