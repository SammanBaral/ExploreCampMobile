import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'ExploreCamp API is running!', timestamp: new Date().toISOString() });
});

// Mock admin routes for testing
app.get('/admin/users', (req, res) => {
    res.json([
        { id: 1, name: 'Admin User', email: 'admin@test.com', location: 'Test City', isAdmin: true }
    ]);
});

app.put('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({ id: parseInt(id), ...req.body, message: 'User updated successfully' });
});

app.post('/admin/users', (req, res) => {
    res.json({ id: Date.now(), ...req.body, message: 'User created successfully' });
});

app.delete('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({ success: true, message: `User ${id} deleted successfully` });
});

app.get('/admin/products', (req, res) => {
    res.json([
        { id: 1, name: 'Test Campsite', location: 'Test Location', pricePerNight: 50 }
    ]);
});

app.put('/admin/products/:id', (req, res) => {
    const { id } = req.params;
    res.json({ id: parseInt(id), ...req.body, message: 'Product updated successfully' });
});

app.delete('/admin/products/:id', (req, res) => {
    const { id } = req.params;
    res.json({ success: true, message: `Product ${id} deleted successfully` });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET  / - Health check');
    console.log('  GET  /admin/users - List users');
    console.log('  POST /admin/users - Create user');
    console.log('  PUT  /admin/users/:id - Update user');
    console.log('  DELETE /admin/users/:id - Delete user');
    console.log('  GET  /admin/products - List products');
    console.log('  PUT  /admin/products/:id - Update product');
    console.log('  DELETE /admin/products/:id - Delete product');
});