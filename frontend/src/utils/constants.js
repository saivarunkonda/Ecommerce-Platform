export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const APP_CONFIG = {
  name: 'E-Shop',
  description: 'Your one-stop e-commerce platform',
  version: '1.0.0',
}

export const ROUTES = {
  home: '/',
  products: '/products',
  productDetail: (id) => `/products/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  login: '/login',
  register: '/register',
  profile: '/profile',
  orders: '/orders',
  orderDetail: (id) => `/orders/${id}`,
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  VENDOR: 'vendor',
}

export const CURRENCY = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
}

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
}

export const ITEMS_PER_PAGE = 12

export const DEBOUNCE_DELAY = 300

export const TOAST_DURATION = 3000

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
