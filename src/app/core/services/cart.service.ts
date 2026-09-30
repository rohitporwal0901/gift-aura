import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

export interface AppliedCoupon {
  code: string;
  discount: number;
  minOrderAmount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_ITEMS_KEY = 'cart_items_v2';
  private readonly STORAGE_COUPON_KEY = 'cart_coupon_v2';
  private readonly STORAGE_LOCATION_KEY = 'cart_loc_v2';

  private _items = signal<CartItem[]>(this.loadStoredItems());
  appliedCoupon = signal<AppliedCoupon | null>(this.loadStoredCoupon());
  isOpenDrawer = signal<boolean>(false);
  drawerMode = signal<'cart' | 'checkout' | 'profile'>('cart');

  openDrawer(mode?: 'cart' | 'checkout' | 'profile'): void {
    if (mode) {
      this.drawerMode.set(mode);
    } else if (this.drawerMode() === 'checkout' && !this.isOpenDrawer()) {
      this.drawerMode.set('cart');
    }
    this.isOpenDrawer.set(true);
  }

  openCheckout(): void {
    this.drawerMode.set('checkout');
    this.isOpenDrawer.set(true);
  }

  openProfile(): void {
    this.drawerMode.set('profile');
    this.isOpenDrawer.set(true);
  }

  setDrawerMode(mode: 'cart' | 'checkout' | 'profile'): void {
    this.drawerMode.set(mode);
  }

  closeDrawer(): void {
    this.isOpenDrawer.set(false);
    setTimeout(() => this.drawerMode.set('cart'), 300); // reset after animation
  }

  // ── Map / Distance signals ────────────────────────────────
  deliveryDistanceKm = signal<number>(0);
  dropDisplayName    = signal<string>('');
  dropLat            = signal<number>(0);
  dropLng            = signal<number>(0);

  items = this._items.asReadonly();

  totalItems = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  itemTotal  = computed(() => this._items().reduce((sum, i) => sum + i.totalPrice, 0));

  // Delivery charge: Free above ₹999, else flat ₹49
  deliveryCharge = computed(() => {
    if (this._items().length === 0) return 0;
    if (this.itemTotal() >= 999) return 0;
    return 49;
  });

  // Discount applies only when itemTotal meets the minOrderAmount
  discount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    const total = this.itemTotal();
    if (total < (coupon.minOrderAmount || 0)) {
      return 0;
    }
    return Math.min(total, coupon.discount);
  });

  grandTotal = computed(() => {
    const items = this.itemTotal();
    if (items === 0) return 0;
    const delivery = this.deliveryCharge();
    const discount = this.discount();
    return Math.max(0, items + delivery - discount);
  });

  constructor() {
    this.loadStoredLocation();

    // Lock background screen scroll when drawer is open
    effect(() => {
      const isOpen = this.isOpenDrawer();
      if (typeof document !== 'undefined') {
        if (isOpen) {
          document.body.classList.add('drawer-open');
          document.documentElement.classList.add('drawer-open');
        } else {
          document.body.classList.remove('drawer-open');
          document.documentElement.classList.remove('drawer-open');
        }
      }
    });

    // Auto-persist cart items
    effect(() => {
      try {
        localStorage.setItem(this.STORAGE_ITEMS_KEY, JSON.stringify(this._items()));
      } catch {}
    });

    // Auto-persist coupon
    effect(() => {
      try {
        const c = this.appliedCoupon();
        if (c) {
          localStorage.setItem(this.STORAGE_COUPON_KEY, JSON.stringify(c));
        } else {
          localStorage.removeItem(this.STORAGE_COUPON_KEY);
        }
      } catch {}
    });

    // Auto-persist drop location
    effect(() => {
      try {
        const loc = {
          dist: this.deliveryDistanceKm(),
          name: this.dropDisplayName(),
          lat: this.dropLat(),
          lng: this.dropLng()
        };
        localStorage.setItem(this.STORAGE_LOCATION_KEY, JSON.stringify(loc));
      } catch {}
    });
  }

  private loadStoredItems(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_ITEMS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  }

  private loadStoredCoupon(): AppliedCoupon | null {
    try {
      const data = localStorage.getItem(this.STORAGE_COUPON_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  private loadStoredLocation(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_LOCATION_KEY);
      if (data) {
        const loc = JSON.parse(data);
        if (loc.name) this.dropDisplayName.set(loc.name);
        if (loc.dist) this.deliveryDistanceKm.set(loc.dist);
        if (loc.lat) this.dropLat.set(loc.lat);
        if (loc.lng) this.dropLng.set(loc.lng);
      }
    } catch {}
  }

  applyCoupon(coupon: AppliedCoupon): void {
    this.appliedCoupon.set(coupon);
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }

  addToCart(product: Product, quantity: number = 1, customizations: string[] = []): void {
    const current = this._items();
    const existing = current.find(i => i.product.id === product.id);

    if (existing) {
      this._items.set(current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity, totalPrice: (i.quantity + quantity) * i.product.price }
          : i
      ));
    } else {
      this._items.set([...current, {
        product,
        quantity,
        selectedCustomizations: customizations,
        totalPrice: quantity * product.price
      }]);
    }
  }

  updateQty(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.set(this._items().map(i =>
      i.product.id === productId
        ? { ...i, quantity, totalPrice: quantity * i.product.price }
        : i
    ));
  }

  removeFromCart(productId: string): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
    if (this._items().length === 0) {
      this.appliedCoupon.set(null);
    }
  }

  getQty(productId: string): number {
    return this._items().find(i => i.product.id === productId)?.quantity ?? 0;
  }

  clearCart(): void {
    this._items.set([]);
    this.appliedCoupon.set(null);
    try {
      localStorage.removeItem(this.STORAGE_ITEMS_KEY);
      localStorage.removeItem(this.STORAGE_COUPON_KEY);
    } catch {}
  }
}
