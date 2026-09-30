import { Component, inject, signal, computed, Input } from '@angular/core';
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
    <div class="profile-page" [class.inline]="inlineMode">
      
      @if (authService.isLoggedIn()) {
        <!-- COMPACT PROFILE HEADER -->
        <div class="profile-header compact">
          @if (inlineMode) {
            <button class="back-btn" (click)="cartService.setDrawerMode('cart')" aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          }

          <div class="user-row">
            <!-- AVATAR WITH PHOTO UPLOAD -->
            <div class="avatar-wrap">
              <input 
                type="file" 
                #photoInput 
                accept="image/*" 
                style="display: none" 
                (change)="onPhotoSelected($event)" 
              />
              
              <div class="avatar" (click)="photoInput.click()" title="Click to change photo">
                @if (authService.currentUser()?.photoUrl) {
                  <img [src]="authService.currentUser()?.photoUrl" alt="Profile" class="avatar-img" />
                } @else {
                  <span>{{ getUserInitials() }}</span>
                }
              </div>

              <button 
                type="button" 
                class="camera-badge-btn" 
                (click)="photoInput.click()" 
                [title]="isUploadingPhoto() ? 'Uploading...' : 'Change photo'"
              >
                @if (isUploadingPhoto()) {
                  <span class="upload-spin">⌛</span>
                } @else {
                  <span>📷</span>
                }
              </button>
            </div>

            <!-- NAME & DETAILS -->
            <div class="user-info">
              <h2 class="profile-name">{{ authService.currentUser()?.name || 'Valued Customer' }}</h2>
              <p class="profile-phone">+91 {{ authService.currentUser()?.phone }}</p>
              <div class="member-chip">
                <span>🎁 Gift Aura Member</span>
              </div>
            </div>
          </div>
        </div>

        <div class="container profile-content">

          <!-- MY ORDERS ACCORDION -->
          <div class="profile-section">
            <div class="menu-card accordion-card">
              <div class="menu-item accordion-header" (click)="myOrdersExpanded.set(!myOrdersExpanded())">
                <div class="header-left">
                  <span class="mi-icon">📦</span>
                  <div class="header-title-box">
                    <span class="mi-label">My Orders</span>
                    <span class="orders-count-text">{{ userOrders().length }} {{ userOrders().length === 1 ? 'order' : 'orders' }} placed</span>
                  </div>
                </div>
                <div class="header-right">
                  <span class="mi-arrow" [class.rotated]="myOrdersExpanded()">›</span>
                </div>
              </div>
              
              @if (myOrdersExpanded()) {
                <div class="accordion-body">
                  @if (userOrders().length === 0) {
                    <div class="empty-orders-wrap">
                      <span class="empty-icon">🛍️</span>
                      <p class="empty-orders-msg">No orders placed yet</p>
                    </div>
                  } @else {
                    <div class="compact-orders-list">
                      @for (order of userOrders(); track order.id) {
                        <div class="co-card">
                          <div class="co-top">
                            <span class="co-id">#{{ order.id.slice(-8).toUpperCase() }}</span>
                            <span class="co-badge" [ngClass]="'st-' + (order.status || 'confirmed')">{{ getStatusLabel(order.status) }}</span>
                          </div>
                          <div class="co-mid">
                            <span class="co-date">{{ formatOrderDate(order.placedAt) }}</span>
                            <span class="co-price">₹{{ order.grandTotal }}</span>
                          </div>
                          <div class="co-items">
                            {{ getOrderItemsPreview(order) }}
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- SETTINGS & PREFERENCES -->
          <div class="profile-section">
            <h3 class="section-label">Preferences & Support</h3>
            <div class="menu-card">
              <a routerLink="/" (click)="inlineMode && cartService.closeDrawer()" class="menu-item">
                <span class="mi-icon">🎟️</span>
                <span class="mi-label">Coupons & Offers</span>
                <span class="mi-arrow">›</span>
              </a>
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

          <!-- LOGOUT BUTTON -->
          <button class="logout-btn" (click)="handleLogout()">
            🚪 Logout of Account
          </button>
        </div>

      } @else {
        <!-- LOGGED-OUT CARD -->
        <div class="logged-out-container">
          <div class="guest-card">
            <div class="guest-icon">🎁</div>
            <h2 class="guest-title">Account & Orders</h2>
            <p class="guest-sub">Log in to view your orders, corporate gifts, and special offers.</p>
            
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
      padding-bottom: 24px;
    }

    .profile-page.inline {
      padding-bottom: 0;
      height: 100%;
      overflow-y: auto;
    }

    /* COMPACT HEADER */
    .profile-header.compact {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #fff;
      padding: 16px 18px;
      position: relative;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
    }

    .back-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.2s;
      &:hover { background: rgba(255, 255, 255, 0.25); }
    }

    .user-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    /* AVATAR & BADGE */
    .avatar-wrap {
      position: relative;
      width: 52px;
      height: 52px;
      flex-shrink: 0;
    }
    .avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #F8FAFC;
      color: #0F172A;
      font-size: 18px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      cursor: pointer;
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
      border: 1.5px solid #0F172A;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .upload-spin {
      animation: spin 1s infinite linear;
      font-size: 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* USER INFO */
    .user-info {
      flex: 1;
      min-width: 0;
    }
    .profile-name {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-phone {
      font-size: 12.5px;
      color: #94A3B8;
      margin: 0 0 4px;
      font-weight: 500;
    }
    .member-chip {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10.5px;
      color: #FCD34D;
      font-weight: 600;
    }

    /* CONTENT */
    .profile-content {
      padding: 16px;
    }
    .profile-section {
      margin-bottom: 16px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      margin: 0 0 8px 4px;
    }

    /* MENU CARD & ACCORDION */
    .menu-card {
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #E2E8F0;
      overflow: hidden;
    }
    .accordion-card {
      border: 1.5px solid #CBD5E1;
    }
    .accordion-header {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: #FFFFFF;
      transition: background 0.15s;
      user-select: none;
      &:hover { background: #F8FAFC; }
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-title-box {
      display: flex;
      flex-direction: column;
    }
    .orders-count-text {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      margin-top: 1px;
    }
    .header-right {
      display: flex;
      align-items: center;
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 13px 16px;
      border-bottom: 1px solid #F1F5F9;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      gap: 12px;
      transition: background 0.15s;
      &:last-child { border-bottom: none; }
      &:hover { background: #F8FAFC; }
    }
    .mi-icon {
      font-size: 17px;
      width: 22px;
      text-align: center;
      flex-shrink: 0;
    }
    .mi-label {
      flex: 1;
      font-size: 13.5px;
      font-weight: 600;
      color: #1E293B;
    }
    .mi-arrow {
      font-size: 18px;
      color: #94A3B8;
      transition: transform 0.25s ease;
    }
    .mi-arrow.rotated {
      transform: rotate(90deg);
    }

    /* ACCORDION BODY */
    .accordion-body {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 12px 14px;
    }
    .empty-orders-wrap {
      text-align: center;
      padding: 16px 8px;
    }
    .empty-icon { font-size: 28px; display: block; margin-bottom: 6px; }
    .empty-orders-msg { font-size: 12.5px; color: #64748B; margin: 0; font-weight: 500; }

    /* ORDER CARD */
    .compact-orders-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .co-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .co-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .co-id {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      font-family: monospace;
    }
    .co-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
    }
    .st-delivered { background: #ECFDF5; color: #047857; }
    .st-pending, .st-confirmed, .st-preparing { background: #FEF3C7; color: #B45309; }
    .st-shipped, .st-out-for-delivery { background: #EFF6FF; color: #1D4ED8; }
    .st-cancelled { background: #FEE2E2; color: #B91C1C; }

    .co-mid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .co-date {
      font-size: 11px;
      color: #64748B;
    }
    .co-price {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
    }
    .co-items {
      font-size: 11.5px;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-top: 1px dashed #E2E8F0;
      padding-top: 6px;
    }

    /* TOGGLE */
    .toggle {
      width: 40px;
      height: 22px;
      background: #CBD5E1;
      border-radius: 999px;
      padding: 2px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle.on { background: #0F172A; }
    .toggle-thumb {
      width: 18px;
      height: 18px;
      background: #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    .toggle.on .toggle-thumb {
      transform: translateX(18px);
    }

    /* LOGOUT */
    .logout-btn {
      width: 100%;
      background: #FFFFFF;
      border: 1.5px solid #FECACA;
      color: #DC2626;
      padding: 12px;
      border-radius: 12px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      margin-top: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      &:hover { background: #FEF2F2; }
      &:active { transform: scale(0.98); }
    }

    /* LOGGED OUT STATE */
    .logged-out-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 24px 16px;
    }
    .guest-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 32px 20px;
      text-align: center;
      max-width: 360px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      border: 1px solid #E2E8F0;
    }
    .guest-icon { font-size: 44px; margin-bottom: 10px; }
    .guest-title { font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 6px; }
    .guest-sub { font-size: 13px; color: #64748B; line-height: 1.45; margin: 0 0 20px; }
    .guest-login-btn {
      width: 100%;
      background: #0F172A;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 13px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
      transition: all 0.2s;
      &:active { transform: scale(0.98); background: #1E293B; }
    }
  `]
})
export class ProfileComponent {
  @Input() inlineMode = false;
  authService = inject(AuthService);
  dataService = inject(DataService);
  cartService = inject(CartService);
  private router = inject(Router);
  
  myOrdersExpanded = signal(true); // Default open so user easily sees orders
  readonly isUploadingPhoto = signal<boolean>(false);

  userOrders = computed<AdminOrder[]>(() => {
    const user = this.authService.currentUser();
    const list = this.dataService.orders();
    if (!user) return [];

    const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);
    const uPhone = cleanPhone(user.phone);
    const uEmail = (user.email || '').trim().toLowerCase();

    const myOrders = list.filter(o => {
      if (o.userId && user.uid && o.userId === user.uid) return true;
      if (uPhone && o.customerPhone && cleanPhone(o.customerPhone) === uPhone) return true;
      if (uEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === uEmail) return true;
      return false;
    });

    return [...myOrders].sort((a, b) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());
  });

  getOrderItemsPreview(order: AdminOrder): string {
    if (!order.items || order.items.length === 0) return 'No items';
    const names = order.items.map(i => `${i.quantity}x ${i.productName}`);
    return names.join(', ');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'preparing': return 'Preparing';
      case 'out-for-delivery': return 'On The Way';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Confirmed';
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

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'GA';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }

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
          const MAX_SIZE = 300;
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
    if (this.inlineMode) {
      this.cartService.closeDrawer();
    } else {
      this.router.navigate(['/']);
    }
  }

  goToLogin(): void {
    if (this.inlineMode) {
      this.cartService.setDrawerMode('cart');
      setTimeout(() => this.cartService.openDrawer(), 10);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  settingsItems: MenuItem[] = [
    { icon: '🔔', label: 'Order Notifications', toggle: true, on: true },
    { icon: '📞', label: 'Help & Customer Support', toggle: false },
    { icon: 'ℹ️', label: 'About Gift Aura', toggle: false },
  ];
}
