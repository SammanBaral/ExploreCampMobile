// API service for ExploreCamp backend integration
// const API_BASE_URL = 'http://localhost:5000'; // Update this to your backend URL
const API_BASE_URL = 'https://10.0.2.2:5000';
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: number;
  email: string;
  name?: string;
  bio?: string;
  location: string;
  createdAt?: string;
  isAdmin?: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  bio?: string;
  location: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface Product {
  id: number;
  name: string;
  location: string;
  about?: string;
  pricePerNight: number;
  images: string[];
  rating: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use HTTP since the backend is running on HTTP
    // Note: This will cause mixed content issues if the app is served over HTTPS
    this.baseURL = 'http://10.0.2.2:5000';
    this.token = localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('Making request to:', url); // Debug log

      const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
      };

      // Only set Content-Type for JSON requests, not for FormData
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      // Add a workaround for mixed content issues
      const requestOptions: RequestInit = {
        ...options,
        headers,
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials
      };

      const response = await fetch(url, requestOptions);

      console.log('Response status:', response.status); // Debug log

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        return { error: data.error || `HTTP ${response.status}: ${response.statusText}` };
      }

      return { data };
    } catch (error) {
      console.error('Network error details:', error);
      return { error: 'Network error occurred' };
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
      // Store user data for fallback
      if (response.data.user) {
        this.storeUser(response.data.user);
      }
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.token) {
      return { error: 'No authentication token' };
    }
    return this.makeRequest<User>('/users/me');
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/users/update/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Product methods
  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>('/products/getAllProducts');
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`);
  }

  async searchProducts(filters: any): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>('/products/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Booking methods
  async createBooking(bookingData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/bookings/user');
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  // Collection methods
  async getUserCollections(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/collections/user');
  }

  async createCollection(collectionData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/collections/create', {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  }

  async addSpotToCollection(collectionId: number, productId: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/collections/addSpot', {
      method: 'POST',
      body: JSON.stringify({ collectionId, productId }),
    });
  }

  // Review methods
  async getProductReviews(productId: number): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/reviews/product/${productId}`);
  }

  async addReview(reviewData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/reviews/add', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getUserReviews(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/reviews/user');
  }

  // Availability methods
  async getProductAvailability(productId: number): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/availability/${productId}`);
  }

  async addProductAvailability(productId: number, dates: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/products/${productId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ dates }),
    });
  }

  // Admin methods
  async adminGetTrending(): Promise<ApiResponse<number[]>> {
    return this.makeRequest<number[]>('/admin/trending');
  }

  async adminGetProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>('/admin/products');
  }

  async adminGetUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('/users/getAllUsers');
  }

  async adminGetStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/stats');
  }

  async adminAddProduct(productData: any): Promise<ApiResponse<Product>> {
    // Check if productData is FormData (for file uploads)
    if (productData instanceof FormData) {
      return this.makeRequest<Product>('/admin/products', {
        method: 'POST',
        body: productData,
        headers: {}, // Don't set Content-Type for FormData, let browser set it with boundary
      });
    } else {
      return this.makeRequest<Product>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    }
  }

  async adminUpdateProduct(id: number, productData: any): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async adminDeleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async adminUpdateUser(id: number, userData: any): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async adminSetTrending(trendingIds: number[]): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/admin/trending', {
      method: 'POST',
      body: JSON.stringify({ trendingIds }),
    });
  }

  // New admin methods for product management
  async createProduct(productData: any): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: number, updateData: any): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async adminAddUser(user: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Decode JWT token to get user ID
  private decodeToken(): { id: number } | null {
    if (!this.token) return null;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  getProfile() {
    const decoded = this.decodeToken();
    if (!decoded) {
      return Promise.resolve({ error: 'No valid token found' });
    }
    return this.makeRequest<User>(`/users/${decoded.id}`);
  }

  // Get user data from localStorage (fallback when API fails)
  getStoredUser(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Store user data in localStorage (called during login)
  storeUser(user: User): void {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  // User Profile APIs
  async getUserProfile(userId: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/users/profile/${userId}`);
  }

  async updateUserProfile(userId: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateContactDetails(userId: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/users/contact/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(userId: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/users/notifications/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfileImage(userId: number, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.makeRequest<any>(`/users/profile-image/${userId}`, {
      method: 'POST',
      body: formData,
    });
  }

  // OTP login methods
  async requestOtp(email: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/users/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/users/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Admin: Get all bookings
  async adminGetBookings(): Promise<ApiResponse<any[]>> {
    console.log('[API] Admin getting bookings...');
    console.log('[API] Token present:', !!this.token);

    const response = await this.makeRequest<any[]>('/admin/bookings');
    console.log('[API] Admin bookings response:', response);
    return response;
  }

  // Admin: Update booking status
  async adminUpdateBookingStatus(id: number, status: string): Promise<ApiResponse<any>> {
    console.log(`[API] Admin updating booking ${id} to status: ${status}`);
    console.log(`[API] Token: ${this.token ? 'Present' : 'Missing'}`);

    const response = await this.makeRequest<any>(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    console.log(`[API] Admin booking status update response:`, response);
    return response;
  }

  // Admin: Delete user (including their bookings and collections)
  async adminDeleteUser(userId: number): Promise<ApiResponse<any>> {
    console.log(`[API] Admin deleting user ${userId}`);
    console.log(`[API] Token: ${this.token ? 'Present' : 'Missing'}`);

    const response = await this.makeRequest<any>(`/admin/users/${userId}`, {
      method: 'DELETE'
    });

    console.log(`[API] Admin user deletion response:`, response);
    return response;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  ApiResponse, LoginRequest, LoginResponse, Product, RegisterRequest, User
};

