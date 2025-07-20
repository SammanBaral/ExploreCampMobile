// Booking service for managing user bookings with backend integration
export interface Booking {
    id: string;
    productId: number;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequest?: string;
    totalPrice: number;
    paymentMethod: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    createdAt: string;
}

interface CreateBookingRequest {
    productId: number;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequest?: string;
    totalPrice: number;
    paymentMethod: string;
}

class BookingService {
    private readonly STORAGE_KEY = 'userBookings';

    // Create a new booking via API
    async createBooking(bookingData: CreateBookingRequest): Promise<{ success: boolean; message?: string; data?: any }> {
        try {
            const response = await fetch('http://10.0.2.2:5000/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Failed to create booking'
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Booking creation error:', error);
            return {
                success: false,
                message: 'Network error occurred'
            };
        }
    }

    // Get all user bookings from API
    async getUserBookings(): Promise<Booking[]> {
        try {
            const response = await fetch('http://10.0.2.2:5000/bookings/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    }

    // Get upcoming bookings (not cancelled)
    async getUpcomingBookings(): Promise<Booking[]> {
        const bookings = await this.getUserBookings();
        const now = new Date();
        return bookings.filter(booking =>
            booking.status !== 'cancelled' &&
            new Date(booking.checkIn) > now
        );
    }

    // Get past bookings
    async getPastBookings(): Promise<Booking[]> {
        const bookings = await this.getUserBookings();
        const now = new Date();
        return bookings.filter(booking =>
            new Date(booking.checkOut) < now
        );
    }

    // Cancel a booking via API
    async cancelBooking(bookingId: string): Promise<boolean> {
        try {
            const response = await fetch(`http://10.0.2.2:5000/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return false;
        }
    }

    // Get booking by ID
    async getBookingById(bookingId: string): Promise<Booking | null> {
        const bookings = await this.getUserBookings();
        return bookings.find(b => b.id === bookingId) || null;
    }

    // Get booking count by status
    async getBookingCounts() {
        const bookings = await this.getUserBookings();
        return {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            pending: bookings.filter(b => b.status === 'pending').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            upcoming: (await this.getUpcomingBookings()).length
        };
    }
}

export const bookingService = new BookingService(); 