// ──────────────────────────────────────────────
//  Fruit Chat — Admin Models (Firestore-based)
// ──────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name: string;
  sku?: string;
  categoryId: string;
  description: string;
  price: number;           // Selling price shown to user
  originalPrice?: number;  // MRP / Crossed price
  stock?: number;
  status: 'active' | 'disabled';
  images: string[];
  isVeg?: boolean;
  isBestseller?: boolean;
  minQty?: number;
  offerText?: string;
  rating?: number;
  ratingCount?: number;
  preparationTime?: number;
  calories?: number;
  customizations?: AdminCustomization[];
  createdAt?: string;
}

export interface AdminCustomization {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description: string;
  status: 'active' | 'disabled';
  createdAt?: string;
}

export interface AdminOrder {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: AdminDeliveryAddress;
  items: AdminOrderItem[];
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  cancellationReason?: string;
  itemTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  placedAt: string;  // ISO string
  estimatedDelivery?: string;
  couponCode?: string;
  notes?: string;
}

export interface AdminDeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface AdminOrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  status: 'success' | 'failed' | 'pending';
  date: string;  // ISO string
}

export interface HomeSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  bg: string;       // CSS gradient or color
  img: string;      // image URL
  link: string;     // route link
  btnText: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface OfferCard {
  heading: string;
  subtext: string;
  amount: number;          // e.g. 50 (Discount amount)
  minOrderAmount?: number; // e.g. 99 (Minimum shopping amount required)
  code?: string;           // e.g. "FRUIT50"
  validText: string;       // e.g. "Valid on orders above ₹99"
  isActive: boolean;
}

export interface ComboCard {
  id: string;
  tag: string;           // e.g. "BESTSELLER COMBO"
  title: string;         // e.g. "Fruit Chaat + Sprouts"
  price: number;
  originalPrice: number;
  btnText: string;       // e.g. "Order Combo"
  link: string;          // route e.g. "/menu"
  image: string;         // Firebase Storage URL (optional)
  bg: string;            // CSS gradient string
  status: 'active' | 'inactive';
  order: number;         // display order
  createdAt?: string;
}
