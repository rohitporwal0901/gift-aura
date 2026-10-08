import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { AdminOrder } from '../../core/models/admin.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-orders-page">
      <!-- HEADER -->
      <header class="page-header">
        <button class="back-btn" (click)="goBack()" aria-label="Go Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Back</span>
        </button>
        <h1 class="page-title">My Orders</h1>
        <span class="orders-count-badge">{{ userOrders().length }} Orders</span>
      </header>

      <div class="container orders-container">
        <!-- FILTER TABS -->
        <div class="order-filter-bar">
          <button
            class="of-pill"
            [class.active]="orderFilter() === 'all'"
            (click)="orderFilter.set('all')"
          >
            All ({{ userOrders().length }})
          </button>
          <button
            class="of-pill"
            [class.active]="orderFilter() === 'active'"
            (click)="orderFilter.set('active')"
          >
            Active ({{ activeOrdersCount() }})
          </button>
          <button
            class="of-pill"
            [class.active]="orderFilter() === 'delivered'"
            (click)="orderFilter.set('delivered')"
          >
            Delivered ({{ deliveredOrdersCount() }})
          </button>
        </div>

        <!-- SKELETON LOADING -->
        @if (isLoadingOrders()) {
          <div class="order-skel-list">
            @for (i of [1, 2, 3]; track i) {
              <div class="order-skel-card">
                <div class="os-head">
                  <div class="os-line w-40"></div>
                  <div class="os-line w-20"></div>
                </div>
                <div class="os-line w-80"></div>
                <div class="os-foot">
                  <div class="os-line w-30"></div>
                  <div class="os-btn"></div>
                </div>
              </div>
            }
          </div>
        } @else if (displayedOrders().length === 0) {
          <!-- EMPTY STATE -->
          <div class="orders-empty-state">
            <span class="empty-emoji">🎁</span>
            <h4>No Orders Found</h4>
            <p>You have no {{ orderFilter() !== 'all' ? orderFilter() : '' }} orders right now.</p>
            @if (orderFilter() !== 'all') {
              <button class="browse-menu-btn" (click)="orderFilter.set('all')">View All Orders</button>
            } @else {
              <a routerLink="/menu" class="browse-menu-btn">Explore Collections →</a>
            }
          </div>
        } @else {
          <!-- ORDERS LIST -->
          <div class="orders-list">
            @for (order of displayedOrders(); track order.id) {
              <div class="swiggy-order-card" [class.active-card]="isActiveOrder(order.status)">
                
                <!-- Card Top: Brand Info & Status -->
                <div class="soc-top">
                  <div class="soc-brand-group">
                    <div class="soc-brand-icon">🎁</div>
                    <div class="soc-restaurant">
                      <span class="soc-brand">GiftAura Prints & Merch</span>
                      <span class="soc-date">
                        <span class="soc-time-icon">🕒</span> {{ formatOrderDate(order.placedAt) }}
                      </span>
                    </div>
                  </div>
                  <span class="soc-badge" [ngClass]="getStatusBadgeClass(order.status)">
                    <span class="soc-badge-dot"></span>
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>

                <!-- Order items box -->
                <div class="soc-items-box">
                  <div class="soc-items-list">
                    @for (item of order.items; track item.productId) {
                      <div class="soc-item-row">
                        <div class="soc-item-left">
                          <span class="veg-symbol"><span class="veg-dot"></span></span>
                          <span class="soc-item-name">{{ item.productName }}</span>
                        </div>
                        <span class="soc-qty-tag">{{ item.quantity }}x</span>
                      </div>
                    }
                  </div>

                  <div class="soc-summary-bar">
                    <div class="soc-summary-info">
                      <span>{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}</span>
                      <span class="soc-bullet">•</span>
                      <span class="soc-summary-pay">{{ order.paymentMethod || 'Online' }}</span>
                    </div>
                    <div class="soc-total-wrap">
                      <span class="soc-total-label">Total</span>
                      <span class="soc-total-val">₹{{ order.grandTotal }}</span>
                    </div>
                  </div>
                </div>

                <!-- Card Bottom -->
                <div class="soc-bottom">
                  <div class="soc-id-chip">
                    <span class="soc-id-hash">#</span>{{ order.id.slice(-6).toUpperCase() }}
                  </div>
                  <div class="soc-btns">
                    @if (isActiveOrder(order.status)) {
                      <a [routerLink]="['/track-order', order.id]" class="soc-track-btn">
                        <span class="track-scooter-icon">🚚</span>
                        <span>Track Live</span>
                        <span class="track-arrow">→</span>
                      </a>
                    } @else {
                      <a [routerLink]="['/track-order', order.id]" class="soc-view-btn">
                        Track Info
                      </a>
                      <button class="soc-reorder-btn" (click)="reorder(order)">
                        <span>🔄</span>
                        <span>Reorder</span>
                      </button>
                    }
                  </div>
                </div>

              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .my-orders-page {
      background: #F8F9FA;
      min-height: 100vh;
      padding-bottom: 90px;
    }

    /* HEADER */
    .page-header {
      background: #fff;
      padding: 14px 16px;
      display: grid;
      grid-template-columns: 80px 1fr 80px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
      @media (min-width: 768px) { top: 72px; }
    }

    .page-title {
      font-size: 18px;
      font-weight: 800;
      text-align: center;
      color: #1A1A1A;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .back-btn {
      background: #F4F4F5;
      border: none;
      font-size: 12.5px;
      font-weight: 700;
      color: #1A1A1A;
      cursor: pointer;
      font-family: inherit;
      padding: 6px 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      justify-self: start;
      transition: all 0.2s;
      &:active { background: #E4E4E7; transform: scale(0.95); }
    }

    .orders-count-badge {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      background: #F8FAFC;
      padding: 4px 10px;
      border-radius: 999px;
      justify-self: end;
      white-space: nowrap;
    }

    .orders-container {
      max-width: 640px;
      margin: 0 auto;
      padding: 16px;
    }

    /* FILTER BAR */
    .order-filter-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .of-pill {
      border: 1.5px solid #E0E0E0;
      background: #fff;
      color: #555;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 999px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      font-family: inherit;
    }
    .of-pill.active {
      background: #C4786A;
      color: #fff;
      border-color: #C4786A;
      box-shadow: 0 2px 8px rgba(15,23,42,0.25);
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* SWIGGY / ZOMATO LEVEL PREMIUM ORDER CARD */
    .swiggy-order-card {
      background: #fff;
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 3px 14px rgba(0,0,0,0.05);
      border: 1px solid #EDEDED;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
      &:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }
      &.active-card {
        border-color: #F59E0B;
        background: linear-gradient(180deg, #FFFBFA 0%, #FFFFFF 100%);
        box-shadow: 0 4px 18px rgba(245,158,11,0.08);
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #F59E0B, #FCD34D);
        }
      }
    }

    /* CARD TOP */
    .soc-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 8px;
    }
    .soc-brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .soc-brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .soc-restaurant {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .soc-brand {
      font-size: 14px;
      font-weight: 800;
      color: #1A1A1A;
      letter-spacing: -0.2px;
    }
    .soc-date {
      font-size: 11px;
      color: #888;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .soc-time-icon { font-size: 11px; }

    /* STATUS BADGE */
    .soc-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      letter-spacing: 0.1px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .soc-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .badge-delivered { background: #F1F5F9; color: #0F172A; border: 1px solid #CBD5E1; }
    .badge-preparing { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
    .badge-out       { background: #E0E7FF; color: #4338CA; border: 1px solid #C7D2FE; }
    .badge-confirmed { background: #DBEAFE; color: #1D4ED8; border: 1px solid #BFDBFE; }
    .badge-cancelled { background: #FEE2E2; color: #B91C1C; border: 1px solid #FECACA; }

    /* ITEMS BOX */
    .soc-items-box {
      background: #F9FAFB;
      border: 1px solid #F0F2F5;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .soc-items-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .soc-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .soc-item-left {
      display: flex;
      align-items: center;
      gap: 7px;
      overflow: hidden;
    }
    .veg-symbol {
      width: 13px;
      height: 13px;
      border: 1.5px solid #C4786A;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .veg-dot {
      width: 5.5px;
      height: 5.5px;
      border-radius: 50%;
      background: #C4786A;
    }
    .soc-item-name {
      font-size: 12.5px;
      font-weight: 600;
      color: #2D3748;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .soc-qty-tag {
      font-size: 11px;
      font-weight: 700;
      color: #4A5568;
      background: #EDF2F7;
      padding: 2px 7px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    /* SUMMARY BAR */
    .soc-summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #E2E8F0;
    }
    .soc-summary-info {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      color: #718096;
      font-weight: 500;
    }
    .soc-bullet { color: #CBD5E0; }
    .soc-summary-pay { color: #4A5568; font-weight: 600; }
    .soc-total-wrap { display: flex; align-items: baseline; gap: 6px; }
    .soc-total-label { font-size: 11px; color: #718096; font-weight: 500; }
    .soc-total-val { font-size: 15.5px; font-weight: 800; color: #1A1A1A; }

    /* CARD BOTTOM */
    .soc-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .soc-id-chip {
      font-size: 11px;
      font-family: monospace;
      font-weight: 700;
      color: #718096;
      background: #F1F5F9;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.3px;
    }
    .soc-id-hash { color: #A0AEC0; }
    .soc-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .soc-track-btn {
      background: linear-gradient(135deg, #C4786A, #A85D50);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 7px 15px;
      border-radius: 10px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 3px 10px rgba(15,23,42,0.3);
      transition: all 0.2s ease;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 14px rgba(15,23,42,0.4);
      }
    }
    .track-scooter-icon { font-size: 14px; }
    .track-arrow { font-size: 13px; transition: transform 0.2s; }
    .soc-track-btn:hover .track-arrow { transform: translateX(2px); }

    .soc-view-btn {
      background: #F8F9FA;
      color: #555;
      border: 1px solid #E2E8F0;
      font-size: 11.5px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 9px;
      text-decoration: none;
      transition: all 0.2s;
      &:hover { background: #EDF2F7; color: #1A1A1A; }
    }
    .soc-reorder-btn {
      background: #F1F5F9;
      color: #0F172A;
      border: 1px solid #CBD5E1;
      font-size: 11.5px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 9px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: inherit;
      transition: all 0.2s;
      &:hover { background: #E2E8F0; border-color: #94A3B8; }
    }

    /* EMPTY STATE */
    .orders-empty-state {
      background: #fff;
      border-radius: 18px;
      padding: 40px 24px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      border: 1px dashed #DDD;
      margin-top: 10px;
      .empty-emoji { font-size: 42px; display: block; margin-bottom: 12px; }
      h4 { font-size: 16px; font-weight: 800; color: #1A1A1A; margin-bottom: 6px; }
      p { font-size: 13px; color: #666; margin-bottom: 18px; }
      .browse-menu-btn {
        display: inline-block;
        background: #C4786A;
        color: #fff;
        padding: 10px 22px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.2s;
        &:hover { background: #1E293B; }
      }
    }

    /* SKELETON */
    .order-skel-list { display: flex; flex-direction: column; gap: 14px; }
    .order-skel-card {
      background: #fff; border-radius: 18px; padding: 18px;
      display: flex; flex-direction: column; gap: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .os-head, .os-foot { display: flex; justify-content: space-between; align-items: center; }
    .os-line {
      height: 12px; border-radius: 4px;
      background: linear-gradient(90deg, #EAEAEA 25%, #F8F8F8 50%, #EAEAEA 75%);
      background-size: 200% 100%; animation: skelShimmer 1.4s infinite;
      &.w-20 { width: 20%; }
      &.w-30 { width: 30%; }
      &.w-40 { width: 40%; }
      &.w-80 { width: 80%; }
    }
    .os-btn {
      width: 80px; height: 30px; border-radius: 8px;
      background: linear-gradient(90deg, #EAEAEA 25%, #F8F8F8 50%, #EAEAEA 75%);
      background-size: 200% 100%; animation: skelShimmer 1.4s infinite;
    }
    @keyframes skelShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class MyOrdersComponent {
  private router = inject(Router);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  readonly isLoadingOrders = signal<boolean>(true);
  orderFilter = signal<'all' | 'active' | 'delivered'>('all');

  constructor() {
    setTimeout(() => this.isLoadingOrders.set(false), 400);
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  userOrders = computed<AdminOrder[]>(() => {
    const user = this.authService.currentUser();
    const list = this.dataService.orders();
    if (!user) return [];

    const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);
    const uPhone = cleanPhone(user.phone);
    const uEmail = (user.email || '').trim().toLowerCase();

    const myOrders = list.filter(o => {
      // 1. Match by authenticated user UID
      if (o.userId && user.uid && o.userId === user.uid) return true;
      // 2. Match by 10-digit phone number
      if (uPhone && o.customerPhone && cleanPhone(o.customerPhone) === uPhone) return true;
      // 3. Match by email if available
      if (uEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === uEmail) return true;
      return false;
    });

    return [...myOrders].sort((a, b) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());
  });

  displayedOrders = computed(() => {
    const orders = this.userOrders();
    const f = this.orderFilter();
    if (f === 'active') {
      return orders.filter(o => this.isActiveOrder(o.status));
    }
    if (f === 'delivered') {
      return orders.filter(o => o.status === 'delivered');
    }
    return orders;
  });

  activeOrdersCount = computed(() =>
    this.userOrders().filter(o => this.isActiveOrder(o.status)).length
  );

  deliveredOrdersCount = computed(() =>
    this.userOrders().filter(o => o.status === 'delivered').length
  );

  isActiveOrder(status: string): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'preparing' || status === 'out-for-delivery';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'delivered': return 'badge-delivered';
      case 'preparing': return 'badge-preparing';
      case 'out-for-delivery': return 'badge-out';
      case 'confirmed': return 'badge-confirmed';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-confirmed';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'preparing': return 'Processing';
      case 'out-for-delivery': return 'Shipped';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Order Placed';
    }
  }

  formatOrderDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const isToday = new Date().toDateString() === d.toDateString();
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      if (isToday) {
        return `Today, ${timeStr}`;
      }
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + timeStr;
    } catch {
      return dateStr;
    }
  }

  reorder(order: AdminOrder): void {
    if (order.items?.length) {
      for (const it of order.items) {
        this.cartService.addToCart({
          id: it.productId,
          name: it.productName,
          price: it.price,
          image: it.productImage || 'assets/images/gift-box.jpg',
          category: 'corporate-kits',
          rating: 4.8,
          ratingCount: 50,
          isVeg: true,
          description: ''
        });
      }
      this.router.navigate(['/cart']);
    }
  }
}
