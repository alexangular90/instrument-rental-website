const API_BASE_URL = 'http://localhost:3001/api';

// Типы данных
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  company?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalOrders: number;
    totalSpent: number;
    memberSince: string;
  };
}

export interface Tool {
  _id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  description: string;
  fullDescription: string;
  price: number;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  included: string[];
  condition: string;
  location: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  inStock: number;
  totalStock: number;
  rating: number;
  reviewCount: number;
  totalRentals: number;
  totalRevenue: number;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  items: Array<{
    toolId: string;
    toolName: string;
    quantity: number;
    pricePerDay: number;
    days: number;
    total: number;
  }>;
  startDate: string;
  endDate: string;
  totalDays: number;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'overdue';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod: string;
  deliveryInfo: {
    address: string;
    date?: string;
    timeSlot?: string;
    instructions?: string;
  };
  deliveryStatus: 'pending' | 'scheduled' | 'delivered' | 'returned';
  notes: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
  createdAt: string;
}

export interface Review {
  _id: string;
  toolId: string;
  customerId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isVerified: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  reportCount: number;
  response?: {
    text: string;
    author: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface Booking {
  _id: string;
  toolId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  pricePerDay: number;
  totalPrice: number;
  notes: string;
  expiresAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

// Утилиты для работы с API
class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; errors?: string[] }> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка запроса');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
  }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Tools API
  async getTools(params?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    available?: boolean;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ tools: Tool[]; pagination: any }>(`/tools?${searchParams}`);
  }

  async getTool(id: string) {
    return this.request<Tool>(`/tools/${id}`);
  }

  async createTool(toolData: Partial<Tool>) {
    return this.request<Tool>('/tools', {
      method: 'POST',
      body: JSON.stringify(toolData),
    });
  }

  async updateTool(id: string, toolData: Partial<Tool>) {
    return this.request(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData),
    });
  }

  async deleteTool(id: string) {
    return this.request(`/tools/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request<Array<{ name: string; subcategories: string[] }>>('/tools/meta/categories');
  }

  async getPopularTools(limit = 10) {
    return this.request<Tool[]>(`/tools/meta/popular?limit=${limit}`);
  }

  // Orders API
  async getOrders(params?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ orders: Order[]; pagination: any }>(`/orders?${searchParams}`);
  }

  async getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    items: Array<{ toolId: string; quantity: number; days: number }>;
    startDate: string;
    endDate: string;
    customerInfo: any;
    deliveryInfo: any;
    paymentMethod: string;
    notes?: string;
  }) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getOrderStatistics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/orders/meta/statistics?${params}`);
  }

  // Reviews API
  async getReviews(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ reviews: Review[]; pagination: any }>(`/reviews?${searchParams}`);
  }

  async getToolReviews(toolId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ reviews: Review[]; rating: any; pagination: any }>(`/reviews/tool/${toolId}?${searchParams}`);
  }

  async createReview(reviewData: {
    toolId: string;
    orderId?: string;
    rating: number;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend?: boolean;
  }) {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async approveReview(id: string) {
    return this.request(`/reviews/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectReview(id: string, reason?: string) {
    return this.request(`/reviews/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings API
  async getBookings(params?: {
    status?: string;
    toolId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ bookings: Booking[]; pagination: any }>(`/bookings?${searchParams}`);
  }

  async getUserBookings(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<Booking[]>(`/bookings/my${params}`);
  }

  async createBooking(bookingData: {
    toolId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    notes?: string;
  }) {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async confirmBooking(id: string) {
    return this.request(`/bookings/${id}/confirm`, {
      method: 'PUT',
    });
  }

  async cancelBooking(id: string, reason?: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async cleanupExpiredBookings() {
    return this.request('/bookings/cleanup/expired', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();