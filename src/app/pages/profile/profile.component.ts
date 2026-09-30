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
        <!-- HEADER -->
        <div class="profile-header">
          @if (inlineMode) {
            <button class="back-btn" (click)="cartService.closeDrawer()" aria-label="Close Profile">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }

          <div class="header-row">
            <!-- AVATAR -->
            <div class="avatar-wrap">
              <input type="file" #photoInput accept="image/*" style="display:none" (change)="onPhotoSelected($event)"/>
              <div class="avatar" (click)="photoInput.click()">
                @if (authService.currentUser()?.photoUrl) {
                  <img [src]="authService.currentUser()?.photoUrl" alt="Profile" class="avatar-img"/>
                } @else {
                  <span class="avatar-initials">{{ getUserInitials() }}</span>
                }
              </div>
              <button type="button" class="cam-btn" (click)="photoInput.click()">
                @if (isUploadingPhoto()) { <span class="spin">⌛</span> }
                @else { <span>📷</span> }
              </button>
            </div>

            <!-- INFO -->
            <div class="header-info">
              <div class="user-name">{{ authService.currentUser()?.name || 'Valued Customer' }}</div>
              <div class="user-phone">+91 {{ authService.currentUser()?.phone }}</div>
              <div class="member-badge">🎁 Gift Aura Member</div>
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="profile-body">

          <!-- MY ORDERS -->
          <div class="section-block">
            <div class="accordion-card" (click)="myOrdersExpanded.set(!myOrdersExpanded())">
              <div class="accordion-row">
                <div class="acco-icon-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/></svg>
                </div>
                <div class="acco-text">
                  <span class="acco-label">My Orders</span>
                  <span class="acco-sub">{{ userOrders().length }} {{ userOrders().length === 1 ? 'order' : 'orders' }} placed</span>
                </div>
                <span class="acco-arrow" [class.open]="myOrdersExpanded()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </div>

            @if (myOrdersExpanded()) {
              <div class="orders-panel">
                @if (userOrders().length === 0) {
                  <div class="orders-empty">
                    <span class="empty-bag">🛍️</span>
                    <span>No orders yet</span>
                  </div>
                } @else {
                  @for (order of userOrders(); track order.id) {
                    <div class="order-card" [ngClass]="'ord-' + (order.status || 'confirmed')">
                      <div class="order-top">
                        <span class="order-id">#{{ order.id.slice(-8).toUpperCase() }}</span>
                        <span class="order-status-chip" [ngClass]="'chip-' + (order.status || 'confirmed')">
                          {{ getStatusLabel(order.status) }}
                        </span>
                      </div>
                      <div class="order-meta">
                        <span class="order-date">{{ formatOrderDate(order.placedAt) }}</span>
                        <span class="order-total">₹{{ order.grandTotal }}</span>
                      </div>
                      <div class="order-items-text">{{ getOrderItemsPreview(order) }}</div>
                    </div>
                  }
                }
              </div>
            }
          </div>

          <!-- PREFERENCES & SUPPORT -->
          <div class="section-block">
            <div class="section-title">Preferences & Support</div>
            <div class="menu-list">
              <a routerLink="/" (click)="inlineMode && cartService.closeDrawer()" class="menu-row">
                <div class="menu-icon-box coupon">🎟️</div>
                <span class="menu-label">Coupons & Offers</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              @for (item of settingsItems; track item.label) {
                <div class="menu-row">
                  <div class="menu-icon-box">{{ item.icon }}</div>
                  <span class="menu-label">{{ item.label }}</span>
                  @if (item.toggle) {
                    <div class="toggle-switch" [class.on]="item.on" (click)="item.on = !item.on; $event.stopPropagation()">
                      <div class="toggle-knob"></div>
                    </div>
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  }
                </div>
              }
            </div>
          </div>

          <!-- LOGOUT -->
          <button class="logout-row" (click)="handleLogout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout of Account</span>
          </button>

        </div>

      } @else {
        <!-- LOGGED OUT -->
        <div class="guest-wrap">
          <div class="guest-card">
            <div class="guest-icon">🎁</div>
            <h2 class="guest-title">Sign In to Gift Aura</h2>
            <p class="guest-sub">View your orders, track deliveries, and access corporate gift offers.</p>
            <button class="guest-btn" (click)="goToLogin()">Login / Sign Up</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .profile-page.inline {
      height: 100%;
      overflow-y: auto;
    }

    /* HEADER */
    .profile-header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 16px 18px;
      position: relative;
    }

    .back-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      color: #fff;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: rgba(255,255,255,0.2); }
    }

    .header-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid rgba(255,255,255,0.85);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      overflow: hidden;
    }

    .avatar-initials {
      font-size: 18px;
      font-weight: 800;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cam-btn {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #fff;
      border: 1.5px solid #0F172A;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      cursor: pointer;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; font-size: 9px; }

    .header-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-phone {
      font-size: 12px;
      color: #94A3B8;
      font-weight: 500;
      margin-bottom: 5px;
    }

    .member-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(245,158,11,0.15);
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      color: #FCD34D;
    }

    /* BODY */
    .profile-body {
      flex: 1;
      background: #F8FAFC;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* SECTION BLOCK */
    .section-block {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
    }

    .section-title {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94A3B8;
      padding: 10px 14px 0;
    }

    /* ACCORDION */
    .accordion-card {
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
      &:hover { background: #F8FAFC; }
    }

    .accordion-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 14px;
    }

    .acco-icon-box {
      width: 32px;
      height: 32px;
      background: #F1F5F9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      flex-shrink: 0;
    }

    .acco-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .acco-label {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
    }

    .acco-sub {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
    }

    .acco-arrow {
      color: #94A3B8;
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      &.open { transform: rotate(180deg); }
    }

    /* ORDERS PANEL */
    .orders-panel {
      border-top: 1px solid #F1F5F9;
      background: #F8FAFC;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 280px;
      overflow-y: auto;
    }

    .orders-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 14px;
      font-size: 12px;
      color: #64748B;
      font-weight: 500;
      .empty-bag { font-size: 24px; }
    }

    .order-card {
      background: #FFFFFF;
      border-radius: 10px;
      padding: 10px 12px;
      border-left: 3px solid #E2E8F0;

      &.ord-delivered { border-left-color: #10B981; }
      &.ord-confirmed, &.ord-pending, &.ord-preparing { border-left-color: #F59E0B; }
      &.ord-out-for-delivery { border-left-color: #3B82F6; }
      &.ord-cancelled { border-left-color: #EF4444; }
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .order-id {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      font-family: monospace;
    }

    .order-status-chip {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .chip-delivered { background: #DCFCE7; color: #047857; }
    .chip-confirmed, .chip-pending, .chip-preparing { background: #FEF3C7; color: #B45309; }
    .chip-out-for-delivery { background: #DBEAFE; color: #1D4ED8; }
    .chip-cancelled { background: #FEE2E2; color: #B91C1C; }

    .order-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .order-date {
      font-size: 11px;
      color: #64748B;
    }

    .order-total {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
    }

    .order-items-text {
      font-size: 11px;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-top: 1px dashed #E2E8F0;
      padding-top: 4px;
      margin-top: 2px;
    }

    /* MENU LIST */
    .menu-list {
      display: flex;
      flex-direction: column;
    }

    .menu-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      border-bottom: 1px solid #F1F5F9;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: background 0.12s;

      &:last-child { border-bottom: none; }
      &:hover { background: #F8FAFC; }
    }

    .menu-icon-box {
      width: 30px;
      height: 30px;
      background: #F1F5F9;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;

      &.coupon { background: #FFFBEB; }
    }

    .menu-label {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
    }

    /* TOGGLE SWITCH */
    .toggle-switch {
      width: 36px;
      height: 20px;
      background: #CBD5E1;
      border-radius: 999px;
      padding: 2px;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;

      &.on { background: #0F172A; }

      .toggle-knob {
        width: 16px;
        height: 16px;
        background: #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.18);
        transition: transform 0.2s;
      }

      &.on .toggle-knob { transform: translateX(16px); }
    }

    /* LOGOUT */
    .logout-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #FFFFFF;
      border: 1px solid #FECACA;
      color: #DC2626;
      border-radius: 10px;
      padding: 11px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;

      &:hover { background: #FEF2F2; }
    }

    /* GUEST */
    .guest-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background: #F8FAFC;
    }

    .guest-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 6px 20px rgba(0,0,0,0.05);
      border: 1px solid #E2E8F0;
    }

    .guest-icon { font-size: 40px; margin-bottom: 10px; }
    .guest-title { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 6px; }
    .guest-sub { font-size: 12.5px; color: #64748B; line-height: 1.45; margin: 0 0 18px; }

    .guest-btn {
      width: 100%;
      background: #0F172A;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      padding: 12px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
      &:active { background: #1E293B; }
    }
  `]
})
export class ProfileComponent {
  @Input() inlineMode = false;
  authService = inject(AuthService);
  dataService = inject(DataService);
  cartService = inject(CartService);
  private router = inject(Router);

  myOrdersExpanded = signal(true);
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
    return order.items.map(i => `${i.quantity}× ${i.productName}`).join(', ');
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      delivered: 'Delivered',
      preparing: 'Preparing',
      'out-for-delivery': 'On The Way',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
    };
    return map[status] || 'Confirmed';
  }

  formatOrderDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const isToday = new Date().toDateString() === d.toDateString();
      const t = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return isToday ? `Today, ${t}` : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + t;
    } catch { return dateStr; }
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user?.name) return 'GA';
    const parts = user.name.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : user.name.slice(0, 2).toUpperCase();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }

    this.isUploadingPhoto.set(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        try {
          const user = this.authService.currentUser();
          if (user?.uid) await this.authService.updateProfilePhoto(user.uid, base64);
        } catch { alert('Failed to upload photo.'); }
        finally { this.isUploadingPhoto.set(false); }
      };
    };
    reader.readAsDataURL(file);
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    if (this.inlineMode) this.cartService.closeDrawer();
    else this.router.navigate(['/']);
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
