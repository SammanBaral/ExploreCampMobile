import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAdmin } from '@/lib/utils';
import apiService from '@/services/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';

const sections = [
    { key: 'products', label: 'Products' },
    { key: 'users', label: 'Users' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'trending', label: 'Trending' },
    { key: 'stats', label: 'Stats' },
];

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('products');
    const [products, setProducts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [trending, setTrending] = useState<number[]>([]);
    const [stats, setStats] = useState<any>({});
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productForm, setProductForm] = useState<any>({
        name: '',
        location: '',
        pricePerNight: 0,
        about: '',
        images: [],
        amenities: [],
        latitude: 0,
        longitude: 0,
        ownerId: 1,
        checkInTime: '2:00 PM',
        checkOutTime: '11:00 AM',
    });
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState<any>({ name: '', email: '', location: '', isAdmin: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    // Add state for availability date selection
    const [availabilityDates, setAvailabilityDates] = useState<string[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilitySuccess, setAvailabilitySuccess] = useState('');
    const [availabilityError, setAvailabilityError] = useState('');
    // Add state for amenities input
    const [amenityInput, setAmenityInput] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', location: '', isAdmin: false });

    // Access control: Only allow admin
    const adminStatus = isAdmin();

    useEffect(() => {
        console.log('[ADMIN] Admin status check:', adminStatus);
        console.log('[ADMIN] User data from localStorage:', localStorage.getItem('userData'));
        console.log('[ADMIN] Auth token:', localStorage.getItem('authToken'));

        if (!adminStatus) {
            console.log('[ADMIN] Not admin, redirecting to home');
            navigate('/home');
        } else {
            console.log('[ADMIN] Admin access granted');
        }
    }, [adminStatus, navigate]);

    // Fetch data
    useEffect(() => {
        if (!adminStatus) return;
        fetchProducts();
        fetchUsers();
        fetchTrending();
        fetchStats();
        fetchBookings();
    }, [adminStatus]);

    const fetchProducts = async () => {
        const res = await apiService.adminGetProducts();
        if (res.data) setProducts(res.data);
    };
    const fetchUsers = async () => {
        const res = await apiService.adminGetUsers();
        if (res.data) setUsers(res.data);
    };
    const fetchTrending = async () => {
        const res = await apiService.adminGetTrending();
        if (res.data) setTrending(res.data);
    };
    const fetchStats = async () => {
        const res = await apiService.adminGetStats();
        if (res.data) setStats(res.data);
    };
    const fetchBookings = async () => {
        console.log('[ADMIN] Fetching bookings...');
        setBookingLoading(true);
        try {
            const res = await apiService.adminGetBookings();
            console.log('[ADMIN] Bookings response:', res);
            if (res.data) {
                console.log('[ADMIN] Setting bookings:', res.data.length, 'bookings');
                setBookings(res.data);
            } else {
                console.error('[ADMIN] Failed to fetch bookings:', res.error);
            }
        } catch (error) {
            console.error('[ADMIN] Error fetching bookings:', error);
        }
        setBookingLoading(false);
    };

    // Product CRUD
    const openProductModal = (product?: any) => {
        setEditingProduct(product || null);
        setProductForm(product ? {
            ...product,
            checkInTime: product.checkInTime || '2:00 PM',
            checkOutTime: product.checkOutTime || '11:00 AM',
        } : {
            name: '',
            location: '',
            pricePerNight: 0,
            about: '',
            images: [],
            amenities: [],
            latitude: 0,
            longitude: 0,
            ownerId: 1,
            checkInTime: '2:00 PM',
            checkOutTime: '11:00 AM',
        });
        setSelectedImages([]);
        setShowProductModal(true);
    };
    const saveProduct = async () => {
        setLoading(true);
        setError('');
        try {
            if (editingProduct) {
                await apiService.adminUpdateProduct(editingProduct.id, productForm);
            } else {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('name', productForm.name);
                formData.append('location', productForm.location);
                formData.append('pricePerNight', productForm.pricePerNight.toString());
                formData.append('about', productForm.about);
                formData.append('latitude', productForm.latitude.toString());
                formData.append('longitude', productForm.longitude.toString());
                formData.append('ownerId', productForm.ownerId.toString());
                formData.append('amenities', JSON.stringify(productForm.amenities));
                formData.append('checkInTime', productForm.checkInTime);
                formData.append('checkOutTime', productForm.checkOutTime);

                // Append images
                selectedImages.forEach((image) => {
                    formData.append('images', image);
                });

                await apiService.adminAddProduct(formData);
            }
            setShowProductModal(false);
            setSelectedImages([]);
            fetchProducts();
        } catch (e) {
            setError('Failed to save product');
        }
        setLoading(false);
    };
    const deleteProduct = async (id: number) => {
        if (!window.confirm('Delete this product?')) return;
        setLoading(true);
        await apiService.adminDeleteProduct(id);
        fetchProducts();
        setLoading(false);
    };

    // Helper for date input
    const handleAddAvailability = async () => {
        if (!editingProduct || availabilityDates.length === 0) return;
        setAvailabilityLoading(true);
        setAvailabilitySuccess('');
        setAvailabilityError('');
        try {
            const res = await apiService.addProductAvailability(editingProduct.id, availabilityDates);
            if (res.data && res.data.success) {
                setAvailabilitySuccess('Availability added!');
                setAvailabilityDates([]);
            } else {
                setAvailabilityError(res.error || 'Failed to add availability');
            }
        } catch (e) {
            setAvailabilityError('Failed to add availability');
        }
        setAvailabilityLoading(false);
    };

    // User edit
    const openUserModal = (user: any) => {
        setEditingUser(user);
        setUserForm({ ...user });
        setShowUserModal(true);
    };
    const saveUser = async () => {
        setLoading(true);
        setError('');
        try {
            await apiService.adminUpdateUser(editingUser.id, userForm);
            setShowUserModal(false);
            fetchUsers();
        } catch (e) {
            setError('Failed to save user');
        }
        setLoading(false);
    };

    // Trending
    const toggleTrending = (id: number) => {
        setTrending((prev) => prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]);
    };
    const saveTrending = async () => {
        setLoading(true);
        await apiService.adminSetTrending(trending);
        setLoading(false);
    };

    const handleStatusChange = async (bookingId: number, newStatus: string) => {
        setBookingLoading(true);
        try {
            console.log(`[ADMIN] Attempting to update booking ${bookingId} to status: ${newStatus}`);

            const response = await apiService.adminUpdateBookingStatus(bookingId, newStatus);
            console.log('[ADMIN] API Response:', response);

            if (response.error) {
                console.error('[ADMIN] Failed to update booking status:', response.error);
                alert(`❌ Failed to update booking status: ${response.error}`);
            } else {
                console.log(`[ADMIN] Successfully updated booking ${bookingId} to ${newStatus}`);

                // Update the local state immediately for better UX
                setBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: newStatus }
                            : booking
                    )
                );

                alert(`✅ Booking status updated to ${newStatus}!`);

                // Refresh the bookings list after a short delay to ensure consistency
                setTimeout(() => {
                    fetchBookings();
                }, 1000);
            }
        } catch (error) {
            console.error('[ADMIN] Error updating booking status:', error);
            alert(`❌ Error updating booking status: ${error}`);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleAddUser = async () => {
        setLoading(true);
        setError('');
        try {
            await apiService.adminAddUser(addUserForm);
            setShowAddUserModal(false);
            setAddUserForm({ name: '', email: '', password: '', location: '', isAdmin: false });
            fetchUsers();
        } catch (e) {
            setError('Failed to add user');
        }
        setLoading(false);
    };

    if (!adminStatus) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar Navigation */}
            <header className="w-full bg-white border-b border-border flex flex-col md:flex-row md:items-center md:justify-between py-4 px-4 md:px-8">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                    <h2 className="text-xl font-bold">Admin Dashboard</h2>
                    <button
                        className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
                        title="Admin Dashboard Help"
                        onClick={() => alert('Admin Dashboard Help:\n\n• Products: Manage camping spots\n• Users: View and manage user accounts\n• Bookings: Handle booking requests\n• Trending: Set featured destinations\n• Stats: View analytics')}
                    >
                        ?
                    </button>
                </div>
                <nav className="flex flex-row gap-2">
                    {sections.map((section) => (
                        <button
                            key={section.key}
                            className={`px-3 py-2 rounded font-medium transition-colors ${activeSection === section.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                            onClick={() => setActiveSection(section.key)}
                        >
                            {section.label}
                        </button>
                    ))}
                </nav>
            </header>
            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 xl:p-16 w-full">
                {/* Products Section */}
                {activeSection === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Products</h3>
                            <Button onClick={() => openProductModal()}>Add Product</Button>
                        </div>
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Name</th>
                                    <th className="text-left py-2">Location</th>
                                    <th className="text-left py-2">Price</th>
                                    <th className="text-left py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b">
                                        <td className="py-2">{p.name}</td>
                                        <td className="py-2">{p.location}</td>
                                        <td className="py-2">Rs. {p.pricePerNight}</td>
                                        <td className="py-2">
                                            <Button size="sm" variant="secondary" onClick={() => openProductModal(p)}>Edit</Button>
                                            <Button size="sm" variant="destructive" className="ml-2" onClick={() => deleteProduct(p.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Product Modal */}
                        {showProductModal && (
                            <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                                <DialogContent>
                                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                                        <DialogHeader>
                                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input placeholder="Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
                                            <Input placeholder="Location" value={productForm.location} onChange={e => setProductForm(f => ({ ...f, location: e.target.value }))} />
                                            <Input placeholder="Price per Night" type="number" value={productForm.pricePerNight} onChange={e => setProductForm(f => ({ ...f, pricePerNight: parseFloat(e.target.value) || 0 }))} />
                                            <Input placeholder="About" value={productForm.about} onChange={e => setProductForm(f => ({ ...f, about: e.target.value }))} />
                                            <Label>Location (Set on Map)</Label>
                                            <MapPicker
                                                lat={productForm.latitude || 45.5231}
                                                lng={productForm.longitude || -122.6765}
                                                onChange={(lat, lng) => setProductForm((f: any) => ({ ...f, latitude: lat, longitude: lng }))}
                                            />
                                            <div className="text-xs text-muted-foreground mb-2">Lat: {productForm.latitude}, Lng: {productForm.longitude}</div>
                                            <Label htmlFor="amenities">Amenities</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {productForm.amenities.map((amenity: string, idx: number) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                                                        {amenity}
                                                        <button type="button" onClick={() => setProductForm(f => ({ ...f, amenities: f.amenities.filter((_, i) => i !== idx) }))} className="ml-1 text-xs">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="amenities"
                                                    placeholder="Add amenity and press Enter"
                                                    value={amenityInput}
                                                    onChange={e => setAmenityInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && amenityInput.trim()) {
                                                            e.preventDefault();
                                                            if (!productForm.amenities.includes(amenityInput.trim())) {
                                                                setProductForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }));
                                                            }
                                                            setAmenityInput('');
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (amenityInput.trim() && !productForm.amenities.includes(amenityInput.trim())) {
                                                            setProductForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }));
                                                            setAmenityInput('');
                                                        }
                                                    }}
                                                >Add</Button>
                                            </div>
                                            <Input placeholder="Owner ID" type="number" value={productForm.ownerId} onChange={e => setProductForm(f => ({ ...f, ownerId: parseInt(e.target.value) || 1 }))} />
                                            {/* Check-in/Check-out Time Fields */}
                                            <div className="flex gap-2">
                                                <Input placeholder="Check-in Time (e.g. 2:00 PM)" value={productForm.checkInTime} onChange={e => setProductForm(f => ({ ...f, checkInTime: e.target.value }))} />
                                                <Input placeholder="Check-out Time (e.g. 11:00 AM)" value={productForm.checkOutTime} onChange={e => setProductForm(f => ({ ...f, checkOutTime: e.target.value }))} />
                                            </div>
                                            {/* Image Upload */}
                                            <div className="space-y-2">
                                                <Label htmlFor="images">Product Images</Label>
                                                <Input
                                                    id="images"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setSelectedImages(files);
                                                    }}
                                                />
                                                {selectedImages.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm text-muted-foreground">
                                                            {selectedImages.length} image(s) selected
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {selectedImages.map((image, index) => (
                                                                <div key={index} className="relative">
                                                                    <img
                                                                        src={URL.createObjectURL(image)}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-20 object-cover rounded border"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Availability Management Section (only for editing existing product) */}
                                            {editingProduct && (
                                                <div className="space-y-2 border-t pt-4 mt-4">
                                                    <Label>Add Available Dates</Label>
                                                    <Input
                                                        type="date"
                                                        multiple={false}
                                                        value={availabilityDates[0] || ''}
                                                        onChange={e => setAvailabilityDates([e.target.value])}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddAvailability}
                                                        disabled={availabilityLoading || !availabilityDates[0]}
                                                    >
                                                        {availabilityLoading ? 'Adding...' : 'Add Date'}
                                                    </Button>
                                                    {availabilitySuccess && <div className="text-green-600 text-sm">{availabilitySuccess}</div>}
                                                    {availabilityError && <div className="text-red-600 text-sm">{availabilityError}</div>}
                                                </div>
                                            )}
                                            {error && <div className="text-red-500">{error}</div>}
                                            <Button onClick={saveProduct} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
                {/* Users Section */}
                {activeSection === 'users' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Users</h3>
                            <Button onClick={() => { setShowAddUserModal(true); setAddUserForm({ name: '', email: 'sammanbaral123@gmail.com', password: 'samman@', location: '', isAdmin: false }); }}>Add User</Button>
                        </div>
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Name</th>
                                    <th className="text-left py-2">Email</th>
                                    <th className="text-left py-2">Location</th>
                                    <th className="text-left py-2">Admin</th>
                                    <th className="text-left py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b">
                                        <td className="py-2">{u.name}</td>
                                        <td className="py-2">{u.email}</td>
                                        <td className="py-2">{u.location}</td>
                                        <td className="py-2">{u.isAdmin ? 'Yes' : 'No'}</td>
                                        <td className="py-2">
                                            <Button size="sm" variant="secondary" onClick={() => openUserModal(u)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Add User Modal */}
                        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
                            <DialogContent className="max-w-md w-full">
                                <DialogHeader>
                                    <DialogTitle>Add User</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <Input placeholder="Name" value={addUserForm.name} onChange={e => setAddUserForm(f => ({ ...f, name: e.target.value }))} />
                                    <Input placeholder="Email" value={addUserForm.email} onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))} />
                                    <Input placeholder="Password" type="password" value={addUserForm.password} onChange={e => setAddUserForm(f => ({ ...f, password: e.target.value }))} />
                                    <Input placeholder="Location" value={addUserForm.location} onChange={e => setAddUserForm(f => ({ ...f, location: e.target.value }))} />
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={addUserForm.isAdmin} onChange={e => setAddUserForm(f => ({ ...f, isAdmin: e.target.checked }))} />
                                        Admin
                                    </label>
                                    {error && <div className="text-red-500 text-sm">{error}</div>}
                                    <Button onClick={handleAddUser} disabled={loading}>{loading ? 'Adding...' : 'Add User'}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {/* User Modal */}
                        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                            <DialogContent className="max-w-md w-full">
                                <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input placeholder="Name" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} />
                                    <Input placeholder="Email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} />
                                    <Input placeholder="Location" value={userForm.location} onChange={e => setUserForm(f => ({ ...f, location: e.target.value }))} />
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={userForm.isAdmin} onChange={e => setUserForm(f => ({ ...f, isAdmin: e.target.checked }))} />
                                        Admin
                                    </label>
                                    {error && <div className="text-red-500">{error}</div>}
                                    <Button onClick={saveUser} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                {/* Bookings Section */}
                {activeSection === 'bookings' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Bookings Management</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => fetchBookings()}>
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Booking Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-yellow-700">
                                    {bookings.filter(b => b.status === 'pending').length}
                                </div>
                                <div className="text-sm text-yellow-600">Pending</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-700">
                                    {bookings.filter(b => b.status === 'confirmed').length}
                                </div>
                                <div className="text-sm text-green-600">Confirmed</div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-700">
                                    {bookings.filter(b => b.status === 'cancelled').length}
                                </div>
                                <div className="text-sm text-red-600">Cancelled</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-700">
                                    {bookings.length}
                                </div>
                                <div className="text-sm text-blue-600">Total</div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg shadow border">
                            <table className="min-w-[900px] w-full text-sm">
                                <thead className="sticky top-0 bg-background z-10">
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left">User</th>
                                        <th className="py-3 px-4 text-left">Campsite</th>
                                        <th className="py-3 px-4 text-left">Dates</th>
                                        <th className="py-3 px-4 text-left">Guest Info</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                        <th className="py-3 px-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookingLoading ? (
                                        <tr><td colSpan={6} className="text-center py-8">Loading bookings...</td></tr>
                                    ) : bookings.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8">No bookings found.</td></tr>
                                    ) : bookings.map((b) => (
                                        <tr key={b.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{b.user?.name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{b.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{b.product?.name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{b.product?.location || 'N/A'}</div>
                                                <div className="text-xs text-green-600">Rs. {b.product?.pricePerNight || 0}/night</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium">
                                                    {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-xs">
                                                    <div><strong>Name:</strong> {b.guestName || 'N/A'}</div>
                                                    <div><strong>Email:</strong> {b.guestEmail || 'N/A'}</div>
                                                    <div><strong>Phone:</strong> {b.guestPhone || 'N/A'}</div>
                                                    {b.specialRequest && (
                                                        <div className="mt-1 p-1 bg-gray-50 rounded text-xs">
                                                            <strong>Special Request:</strong> {b.specialRequest}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                            b.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                                        }`}>
                                                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                                    </span>
                                                    <div className="text-xs text-muted-foreground">
                                                        Created: {new Date(b.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-2">
                                                    {b.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleStatusChange(b.id, 'confirmed')}
                                                            disabled={bookingLoading}
                                                        >
                                                            ✓ Confirm
                                                        </Button>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                            onClick={() => handleStatusChange(b.id, 'pending')}
                                                            disabled={bookingLoading}
                                                        >
                                                            ↺ Revert to Pending
                                                        </Button>
                                                    )}
                                                    <select
                                                        className="border rounded px-2 py-1 text-xs"
                                                        value={b.status}
                                                        onChange={e => handleStatusChange(b.id, e.target.value)}
                                                        disabled={bookingLoading}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <div className="text-xs text-muted-foreground">
                                                        Total: ${b.totalPrice || 0}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Trending Section */}
                {activeSection === 'trending' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Trending Destinations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((p) => (
                                <div key={p.id} className={`p-4 border rounded-lg flex flex-col gap-2 ${trending.includes(p.id) ? 'bg-primary/10 border-primary' : ''}`}>
                                    <div className="font-semibold">{p.name}</div>
                                    <div className="text-sm text-muted-foreground">{p.location}</div>
                                    <Button size="sm" variant={trending.includes(p.id) ? 'secondary' : 'outline'} onClick={() => toggleTrending(p.id)}>
                                        {trending.includes(p.id) ? 'Remove from Trending' : 'Add to Trending'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-6" onClick={saveTrending} disabled={loading}>{loading ? 'Saving...' : 'Save Trending'}</Button>
                    </div>
                )}
                {/* Stats Section */}
                {activeSection === 'stats' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">App Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-card p-6 rounded-lg shadow-soft text-center">
                                <div className="text-3xl font-bold">{stats.userCount ?? '-'}</div>
                                <div className="text-muted-foreground mt-2">Users</div>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-soft text-center">
                                <div className="text-3xl font-bold">{stats.productCount ?? '-'}</div>
                                <div className="text-muted-foreground mt-2">Products</div>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-soft text-center">
                                <div className="text-3xl font-bold">{stats.bookingCount ?? '-'}</div>
                                <div className="text-muted-foreground mt-2">Bookings</div>
                            </div>
                            {/* Add more stats as needed */}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard; 