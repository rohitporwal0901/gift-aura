import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { AdminOrder } from '../../core/models/admin.model';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
  toggle?: boolean;
  on?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      
      @if (authService.isLoggedIn()) {
        <!-- LOGGED-IN PROFILE HEADER -->
        <div class="profile-header">
          <div class="ph-bg-circle c1"></div>
          <div class="ph-bg-circle c2"></div>

          <!-- AVATAR WITH PHOTO UPLOAD (KHANDELWAL ARCHITECTURE) -->
          <div class="avatar-wrap">
            <input 
              type="file" 
              #photoInput 
              accept="image/*" 
              style="display: none" 
              (change)="onPhotoSelected($event)" 
            />
            
            <div class="avatar" (click)="photoInput.click()" title="Click to upload profile photo">
              @if (authService.currentUser()?.photoUrl) {
                <img [src]="authService.currentUser()?.photoUrl" alt="Profile" class="avatar-img" />
              } @else {
                <span>{{ getUserInitials() }}</span>
              }
            </div>

            <!-- Camera upload badge button -->
            <button 
              type="button" 
              class="camera-badge-btn" 
              (click)="photoInput.click()" 
              [title]="isUploadingPhoto() ? 'Uploading...' : 'Upload profile picture'"
            >
              @if (isUploadingPhoto()) {
                <span class="upload-spin">⌛</span>
              } @else {
                <span>📷</span>
              }
            </button>
          </div>

          <!-- USER NAME & INFO -->
          <h2 class="profile-name">{{ authService.currentUser()?.name }}</h2>
          <p class="profile-phone">+91 {{ authService.currentUser()?.phone }}</p>
          <div class="health-member-badge">
            <span>🥑 Fruit Club • <b>Gold Member</b></span>
          </div>

          <!-- STATS CARD -->
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-val">{{ userOrders().length }}</span>
              <span class="stat-label">&#129367; Orders</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">14d</span>
              <span class="stat-label">&#128293; Streak</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">&#8377;{{ totalSpent() }}</span>
              <span class="stat-label">&#10024; Total Spent</span>
            </div>
          </div>
        </div>

        <div class="container profile-content">

          <!-- ACTIVE ORDER STRIP (IF ANY ACTIVE ORDER IN PROGRESS) -->
          @if (activeOrdersCount() > 0) {
            <div class="profile-section">
              <a routerLink="/my-orders" class="active-order-strip">
                <div class="aos-left">
                  <span class="aos-pulse"></span>
                  <div class="aos-info">
                    <span class="aos-title">🛵 Order In Progress</span>
                    <span class="aos-sub">You have {{ activeOrdersCount() }} live order{{ activeOrdersCount() > 1 ? 's' : '' }}</span>
                  </div>
                </div>
                <span class="aos-link">Track Order →</span>
              </a>
            </div>
          }

          <!-- ACTIVITY ITEMS -->
          <div class="profile-section">
            <h3 class="section-label">More Activity</h3>
            <div class="menu-card">
              @for (item of activityItems; track item.label) {
                <a [routerLink]="item.route || '/'" class="menu-item">
                  <span class="mi-icon">{{ item.icon }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  @if (item.label === 'My Orders' && userOrders().length > 0) {
                    <span class="orders-chip">{{ userOrders().length }} orders</span>
                  }
                  <span class="mi-arrow">›</span>
                </a>
              }
            </div>
          </div>

          <!-- SETTINGS -->
          <div class="profile-section">
            <h3 class="section-label">Settings</h3>
            <div class="menu-card">
              @for (item of settingsItems; track item.label) {
                <div class="menu-item">
                  <span class="mi-icon">{{ item.icon }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  @if (item.toggle) {
                    <div class="toggle" [class.on]="item.on" (click)="item.on = !item.on">
                      <div class="toggle-thumb"></div>
                    </div>
                  } @else {
                    <span class="mi-arrow">›</span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- LOGOUT BUTTON (KHANDELWAL ARCHITECTURE) -->
          <button class="logout-btn" (click)="handleLogout()">
            &#128682; Logout of Account
          </button>
        </div>

      } @else {
        <!-- LOGGED-OUT CARD -->
        <div class="logged-out-container">
          <div class="guest-card">
            <div class="guest-icon">🥑</div>
            <h2 class="guest-title">Account & Preferences</h2>
            <p class="guest-sub">Log in to view your orders, exclusive fruit club offers, and healthy streaks.</p>
            
            <button class="guest-login-btn" (click)="goToLogin()">
              Login / Sign Up
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .profile-page {
      padding-bottom: 20px;
    }

    /* HEADER */
    .profile-header {
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 60%, #174218 100%);
      color: #fff;
      padding: 36px 16px 28px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .ph-bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      pointer-events: none;
    }
    .ph-bg-circle.c1 {
      width: 220px;
      height: 220px;
      top: -60px;
      right: -50px;
    }
    .ph-bg-circle.c2 {
      width: 160px;
      height: 160px;
      bottom: -40px;
      left: -30px;
    }

    /* AVATAR & CAMERA BADGE */
    .avatar-wrap {
      position: relative;
      width: 82px;
      height: 82px;
      margin: 0 auto 12px;
      cursor: pointer;
    }
    .avatar {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background: #E8F5E9;
      color: #2E7D32;
      font-size: 28px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.03);
      }
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .camera-badge-btn {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #FFFFFF;
      border: 2px solid #2E7D32;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
      transition: transform 0.15s ease;
      &:active {
        transform: scale(0.92);
      }
    }
    .upload-spin {
      animation: spin 1s infinite linear;
      font-size: 12px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* NAME & PHONE */
    .profile-name {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
      color: #fff;
    }
    .profile-phone {
      font-size: 12.5px;
      opacity: 0.88;
      margin-bottom: 8px;
      font-weight: 600;
    }

    /* HEALTH MEMBER BADGE */
    .health-member-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 11.5px;
      color: #E8F5E9;
      margin-bottom: 14px;
    }
    .health-member-badge b {
      color: #FFD54F;
      font-weight: 700;
    }

    /* STATS CARD */
    .profile-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 12px 6px;
      max-width: 420px;
      margin: 0 auto;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex: 1;
    }
    .stat-val {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #fff;
    }
    .stat-label {
      font-size: 11px;
      opacity: 0.85;
      font-weight: 500;
      color: #E8F5E9;
    }
    .stat-divider {
      width: 1px;
      height: 30px;
      background: rgba(255, 255, 255, 0.2);
    }

    /* CONTENT */
    .profile-content {
      margin-top: 14px;
    }
    .profile-section {
      margin-bottom: 16px;
    }
    .section-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 0 4px;
    }
    .section-label {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6B7280;
      margin: 0 0 8px 4px;
    }
    .section-top .section-label {
      margin: 0;
    }

    /* MY ORDERS SECTION & PREMIUM CARDS */
    .orders-header-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
      padding: 0 2px;
    }
    /* ACTIVE ORDER STRIP */
    .active-order-strip {
      background: linear-gradient(135deg, #1B5E20, #2E7D32);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(46,125,50,0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      &:active { transform: scale(0.98); }
      &:hover { box-shadow: 0 6px 18px rgba(46,125,50,0.35); }
    }
    .aos-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .aos-pulse {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #76FF03;
      box-shadow: 0 0 0 0 rgba(118, 255, 3, 0.7);
      animation: liveGlow 1.5s infinite;
    }
    @keyframes liveGlow {
      0% { box-shadow: 0 0 0 0 rgba(118, 255, 3, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(118, 255, 3, 0); }
      100% { box-shadow: 0 0 0 0 rgba(118, 255, 3, 0); }
    }
    .aos-info {
      display: flex;
      flex-direction: column;
    }
    .aos-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #fff;
    }
    .aos-sub {
      font-size: 11px;
      color: #C8E6C9;
      font-weight: 500;
    }
    .aos-link {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      background: rgba(255,255,255,0.2);
      padding: 6px 12px;
      border-radius: 8px;
      white-space: nowrap;
    }

    .orders-chip {
      background: #E8F5E9;
      color: #2E7D32;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      margin-left: auto;
      margin-right: 6px;
    }


    /* MENU CARD */
    .menu-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E7EB;
      overflow: hidden;
    }
    .menu-item {
      display: flex;
      align-items: center;
      padding: 13px 16px;
      border-bottom: 1px solid #F3F4F6;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
      gap: 12px;
      &:last-child { border-bottom: none; }
      &:hover { background: #FAFAFA; }
    }
    .mi-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    .mi-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #1F2937;
    }
    .mi-arrow {
      font-size: 18px;
      color: #9CA3AF;
      line-height: 1;
    }


    /* TOGGLE */
    .toggle {
      width: 44px;
      height: 24px;
      background: #D1D5DB;
      border-radius: 999px;
      padding: 2px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle.on {
      background: #2E7D32;
    }
    .toggle-thumb {
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      transition: transform 0.2s;
    }
    .toggle.on .toggle-thumb {
      transform: translateX(20px);
    }

    /* LOGOUT */
    .logout-btn {
      width: 100%;
      background: #fff;
      border: 1.5px solid #FCA5A5;
      color: #DC2626;
      padding: 13px;
      border-radius: 14px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      margin-top: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(220, 38, 38, 0.08);
      &:hover { background: #FEF2F2; }
      &:active { transform: scale(0.98); }
    }

    /* LOGGED OUT STATE */
    .logged-out-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: 24px 16px;
    }
    .guest-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 36px 24px;
      text-align: center;
      max-width: 380px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
    }
    .guest-icon { font-size: 48px; margin-bottom: 12px; }
    .guest-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px; }
    .guest-sub { font-size: 13.5px; color: #6B7280; line-height: 1.5; margin: 0 0 24px; }
    .guest-login-btn {
      width: 100%;
      background: #2E7D32;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      padding: 14px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(46, 125, 50, 0.35);
      transition: all 0.2s;
      &:active { transform: scale(0.98); background: #1B5E20; }
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  cartService = inject(CartService);
  private router = inject(Router);

  readonly isUploadingPhoto = signal<boolean>(false);
  readonly isLoadingOrders = signal<boolean>(true);

  constructor() {
    setTimeout(() => this.isLoadingOrders.set(false), 600);
  }

  orderFilter = signal<'all' | 'active' | 'delivered'>('all');

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

  scrollToOrders(): void {
    const el = document.getElementById('myOrdersSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  totalSpent = computed(() =>
    this.userOrders().reduce((acc, o) => acc + (o.grandTotal || 0), 0)
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
      case 'preparing': return 'Preparing';
      case 'out-for-delivery': return 'On the way';
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
          image: it.productImage || 'assets/images/mix-fruit-chaat.jpg',
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

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'FC';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }

  // ─── Photo Upload & Canvas Resizing (Khandelwal Architecture) ─
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, etc.)');
        return;
      }

      this.isUploadingPhoto.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300; // Optimal 300x300 for Firestore storage
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.85);

          try {
            const user = this.authService.currentUser();
            if (user?.uid) {
              await this.authService.updateProfilePhoto(user.uid, base64);
            }
          } catch (err) {
            alert('Failed to update profile picture. Please try again.');
          } finally {
            this.isUploadingPhoto.set(false);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/auth']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }

  activityItems: MenuItem[] = [
    { icon: '📦', label: 'My Orders', route: '/my-orders' },
    { icon: '❤️', label: 'Favourites', route: '/menu' },
    { icon: '🎟️', label: 'Coupons & Offers', route: '/' },
  ];

  settingsItems: MenuItem[] = [
    { icon: '🔔', label: 'Notifications', toggle: true, on: true },
    { icon: '🌙', label: 'Dark Mode', toggle: true, on: false },
    { icon: '📞', label: 'Help & Support', toggle: false },
    { icon: 'ℹ️', label: 'About FruitChat', toggle: false },
  ];
}
