import { Component, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { AdminOrder } from '../../core/models/admin.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page" [class.inline]="inlineMode">

      @if (authService.isLoggedIn()) {
        <!-- LUXURY OBSIDIAN & GOLD HEADER -->
        <div class="profile-header">
          @if (inlineMode) {
            <button class="profile-close-btn" (click)="cartService.closeDrawer()" aria-label="Close Profile">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }

          <div class="header-card">
            <!-- AVATAR WITH GOLD GLOW -->
            <div class="avatar-wrap">
              <input type="file" #photoInput accept="image/*" style="display:none" (change)="onPhotoSelected($event)"/>
              <div class="avatar" (click)="photoInput.click()" title="Change Profile Photo">
                @if (authService.currentUser()?.photoUrl) {
                  <img [src]="authService.currentUser()?.photoUrl" alt="Profile" class="avatar-img"/>
                } @else {
                  <span class="avatar-initials">{{ getUserInitials() }}</span>
                }
              </div>
              <button type="button" class="cam-btn" (click)="photoInput.click()" title="Upload Photo">
                @if (isUploadingPhoto()) { 
                  <span class="spin">⌛</span> 
                } @else { 
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                }
              </button>
            </div>

            <!-- USER INFO -->
            <div class="header-info">
              <div class="user-name-row">
                <h3 class="user-name">{{ authService.currentUser()?.name || 'Valued Customer' }}</h3>
                <span class="verified-icon" title="Verified Customer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#38BDF8">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>
              <div class="user-phone">
                <span class="flag-icon">🇮🇳</span>
                <span>+91 {{ formatPhone(authService.currentUser()?.phone) }}</span>
              </div>
              <div class="member-badge">
                <span class="crown-icon">👑</span>
                <span>GiftAura Club Member</span>
              </div>
            </div>
          </div>

          <!-- QUICK STATS BAR -->
          <div class="header-stats-row">
            <div class="stat-pill">
              <span class="stat-icon">🛍️</span>
              <span class="stat-text"><strong>{{ userOrders().length }}</strong> {{ userOrders().length === 1 ? 'Order' : 'Orders' }}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-icon">⚡</span>
              <span class="stat-text">Express Delivery</span>
            </div>
          </div>
        </div>

        <!-- BODY CONTENT -->
        <div class="profile-body">

          <!-- MY ORDERS SECTION -->
          <div class="section-card">
            <div class="section-header-bar" (click)="myOrdersExpanded.set(!myOrdersExpanded())">
              <div class="shb-left">
                <div class="shb-icon-wrap orders">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <div class="shb-titles">
                  <span class="shb-title">My Orders</span>
                  <span class="shb-sub">{{ userOrders().length }} {{ userOrders().length === 1 ? 'order placed' : 'orders placed' }}</span>
                </div>
              </div>

              <div class="shb-right">
                <span class="badge-count">{{ userOrders().length }}</span>
                <span class="expand-arrow" [class.open]="myOrdersExpanded()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>

            <!-- EXPANDABLE ORDERS LIST -->
            @if (myOrdersExpanded()) {
              <div class="orders-list-wrap">
                @if (userOrders().length === 0) {
                  <div class="orders-empty-state">
                    <div class="empty-icon-bubble">🎁</div>
                    <h4 class="empty-title">No orders yet</h4>
                    <p class="empty-desc">Your order history and live parcel tracking will appear here.</p>
                    <a routerLink="/menu" (click)="inlineMode && cartService.closeDrawer()" class="empty-cta-btn">
                      Explore Gift Collections →
                    </a>
                  </div>
                } @else {
                  @for (order of userOrders(); track order.id) {
                    <div class="luxury-order-card">
                      <!-- CARD TOP ROW -->
                      <div class="loc-head">
                        <div class="loc-id-wrap">
                          <span class="loc-tag">ORDER</span>
                          <span class="loc-id">#{{ order.id.slice(-8).toUpperCase() }}</span>
                        </div>
                        <div class="loc-status-chip" [ngClass]="'chip-' + (order.status || 'confirmed')">
                          <span class="status-pulse-dot"></span>
                          <span>{{ getStatusLabel(order.status) }}</span>
                        </div>
                      </div>

                      <!-- DATE & TIME -->
                      <div class="loc-date-row">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{{ formatOrderDate(order.placedAt) }}</span>
                      </div>

                      <!-- ITEMS LIST WITH REAL PRODUCT IMAGES -->
                      <div class="loc-items-list">
                        @for (item of (order.items || []).slice(0, 2); track item.productId + $index) {
                          <div class="loc-item-row">
                            <div class="loc-item-thumb">
                              <img 
                                [src]="getProductImage(item)" 
                                [alt]="item.productName" 
                                (error)="onImgError($event)" 
                                class="thumb-img"
                              />
                              <span class="loc-qty-badge">{{ item.quantity }}x</span>
                            </div>
                            <div class="loc-item-details">
                              <h5 class="loc-item-title" [title]="item.productName">{{ item.productName }}</h5>
                              <span class="loc-item-pricing">₹{{ item.price || item.total }}</span>
                            </div>
                          </div>
                        }

                        @if (order.items && order.items.length > 2) {
                          <div class="loc-more-pill">
                            + {{ order.items.length - 2 }} more {{ order.items.length - 2 === 1 ? 'item' : 'items' }}
                          </div>
                        }
                      </div>

                      <!-- CARD FOOTER: GRAND TOTAL -->
                      <div class="loc-footer">
                        <div class="loc-total-box">
                          <span class="loc-total-label">Total Amount</span>
                          <span class="loc-grand-price">₹{{ order.grandTotal }}</span>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            }
          </div>

          <!-- PREFERENCES & SUPPORT -->
          <div class="section-card">
            <div class="section-label">Preferences &amp; Support</div>

            <div class="menu-list">
              <!-- COUPONS -->
              <a routerLink="/" (click)="inlineMode && cartService.closeDrawer()" class="menu-item-row">
                <div class="menu-icon-wrap coupon">
                  <span>🏷️</span>
                </div>
                <div class="menu-meta">
                  <span class="menu-title">Coupons &amp; Offers</span>
                  <span class="menu-subtitle">View exclusive gifting discounts</span>
                </div>
                <svg class="chevron-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>

              <!-- NOTIFICATIONS TOGGLE -->
              <div class="menu-item-row">
                <div class="menu-icon-wrap notif">
                  <span>🔔</span>
                </div>
                <div class="menu-meta">
                  <span class="menu-title">Order Updates</span>
                  <span class="menu-subtitle">Instant SMS &amp; WhatsApp alerts</span>
                </div>
                <div class="toggle-switch" [class.on]="notificationsEnabled()" (click)="notificationsEnabled.set(!notificationsEnabled())">
                  <div class="toggle-knob"></div>
                </div>
              </div>

              <!-- SUPPORT -->
              <a href="https://wa.me/918461909143" target="_blank" class="menu-item-row">
                <div class="menu-icon-wrap support">
                  <span>💬</span>
                </div>
                <div class="menu-meta">
                  <span class="menu-title">Help &amp; Customer Support</span>
                  <span class="menu-subtitle">Chat with our gifting specialist</span>
                </div>
                <svg class="chevron-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>

              <!-- ABOUT -->
              <div class="menu-item-row" (click)="openAbout()">
                <div class="menu-icon-wrap about">
                  <span>✨</span>
                </div>
                <div class="menu-meta">
                  <span class="menu-title">About GiftAura</span>
                  <span class="menu-subtitle">Premium custom corporate gifts</span>
                </div>
                <svg class="chevron-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <!-- LOGOUT BUTTON WITH ANIMATED CONFIRMATION -->
          <div class="logout-container">
            @if (!showLogoutConfirm()) {
              <button class="logout-action-btn animate-fade-in" (click)="showLogoutConfirm.set(true)" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout of Account</span>
              </button>
            } @else {
              <div class="logout-confirm-card animate-pop-in">
                <span class="lcc-question">Sure you want to logout?</span>
                <div class="lcc-actions">
                  <!-- CROSS / CANCEL (✕) BUTTON -->
                  <button 
                    class="lcc-btn cancel" 
                    (click)="showLogoutConfirm.set(false)" 
                    type="button" 
                    title="Cancel"
                    aria-label="Cancel"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  <!-- RIGHT / CHECKMARK (✓) BUTTON -->
                  <button 
                    class="lcc-btn confirm" 
                    (click)="handleLogout()" 
                    type="button" 
                    title="Yes, Logout"
                    aria-label="Confirm Logout"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

        </div>

      } @else {
        <!-- GUEST / LOGGED OUT -->
        <div class="guest-wrap">
          <div class="guest-card">
            <div class="guest-icon-frame">🎁</div>
            <h2 class="guest-title">Sign In to GiftAura</h2>
            <p class="guest-sub">View your order history, track deliveries, and unlock special member discounts.</p>
            <button class="guest-btn" (click)="goToLogin()">Login / Sign Up</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      height: 100%;
      width: 100%;
    }

    .profile-page {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      width: 100%;
      background: #F8FAFC;
    }

    .profile-page.inline {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    /* HEADER: LUXURY OBSIDIAN & GOLD */
    .profile-header {
      background: linear-gradient(145deg, #090D16 0%, #111827 55%, #1E293B 100%);
      padding: max(16px, env(safe-area-inset-top)) 18px 18px;
      position: relative;
      border-bottom: 1px solid rgba(212, 160, 23, 0.2);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .profile-close-btn {
      position: absolute;
      top: max(14px, env(safe-area-inset-top));
      right: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      padding: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: rotate(90deg);
      }
      &:active {
        transform: scale(0.92);
      }
    }

    .header-card {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 4px;
    }

    /* AVATAR WITH GOLD ACCENT */
    .avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .avatar {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      color: #FBBF24;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #D4A017;
      box-shadow: 0 4px 14px rgba(212, 160, 23, 0.3);
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.03);
      }
    }

    .avatar-initials {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      font-family: 'Outfit', sans-serif;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cam-btn {
      position: absolute;
      bottom: -1px;
      right: -1px;
      background: #FFFFFF;
      border: 1.5px solid #0F172A;
      color: #0F172A;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      transition: transform 0.15s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
      font-size: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* USER INFO */
    .header-info {
      flex: 1;
      min-width: 0;
    }

    .user-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }

    .user-name {
      font-family: 'Outfit', -apple-system, sans-serif;
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: capitalize;
      letter-spacing: -0.2px;
    }

    .verified-icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .user-phone {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #94A3B8;
      font-weight: 600;
      margin-bottom: 6px;

      .flag-icon {
        font-size: 13px;
      }
    }

    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 9999px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
      color: #FCD34D;
      letter-spacing: 0.2px;

      .crown-icon {
        font-size: 11px;
      }
    }

    /* HEADER QUICK STATS */
    .header-stats-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 11.5px;
      color: #E2E8F0;

      strong {
        color: #FCD34D;
        font-weight: 800;
      }
    }

    /* BODY */
    .profile-body {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* SECTION CARD */
    .section-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }

    .section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94A3B8;
      padding: 14px 16px 4px;
    }

    /* SECTION HEADER BAR */
    .section-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s ease;

      &:hover {
        background: #F8FAFC;
      }
    }

    .shb-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .shb-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.orders {
        background: #FEF3C7;
        color: #B45309;
      }
    }

    .shb-titles {
      display: flex;
      flex-direction: column;
    }

    .shb-title {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      font-family: 'Outfit', sans-serif;
    }

    .shb-sub {
      font-size: 11.5px;
      color: #64748B;
      font-weight: 500;
    }

    .shb-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge-count {
      background: #F1F5F9;
      color: #0F172A;
      font-size: 11.5px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .expand-arrow {
      color: #94A3B8;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;

      &.open {
        transform: rotate(180deg);
      }
    }

    /* ORDERS LIST */
    .orders-list-wrap {
      border-top: 1px solid #F1F5F9;
      background: #FAFAFA;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 420px;
      overflow-y: auto;
    }

    .orders-empty-state {
      padding: 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .empty-icon-bubble {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #FEF3C7;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      .empty-title {
        font-size: 14px;
        font-weight: 800;
        color: #0F172A;
        margin: 0 0 4px;
      }

      .empty-desc {
        font-size: 12px;
        color: #64748B;
        margin: 0 0 14px;
        max-width: 240px;
        line-height: 1.4;
      }

      .empty-cta-btn {
        display: inline-block;
        background: #0F172A;
        color: #FFFFFF;
        font-size: 12.5px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 9999px;
        text-decoration: none;
        transition: background 0.15s ease;

        &:hover {
          background: #1E293B;
        }
      }
    }

    /* LUXURY ORDER CARD */
    .luxury-order-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 12px 14px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;

      &:hover {
        border-color: #CBD5E1;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      }
    }

    .loc-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .loc-id-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .loc-tag {
      font-size: 9.5px;
      font-weight: 800;
      color: #64748B;
      background: #F1F5F9;
      padding: 2px 5px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .loc-id {
      font-size: 12.5px;
      font-weight: 800;
      color: #0F172A;
      font-family: monospace;
      letter-spacing: 0.3px;
    }

    .loc-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 9999px;

      .status-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      &.chip-delivered {
        background: #DCFCE7;
        color: #15803D;
      }
      &.chip-confirmed, &.chip-pending, &.chip-preparing {
        background: #FEF3C7;
        color: #B45309;
      }
      &.chip-out-for-delivery {
        background: #DBEAFE;
        color: #1D4ED8;
      }
      &.chip-cancelled {
        background: #FEE2E2;
        color: #B91C1C;
      }
    }

    .loc-date-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #64748B;
      margin-bottom: 10px;
    }

    /* ITEMS LIST WITH IMAGES */
    .loc-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
      border-top: 1px dashed #E2E8F0;
      border-bottom: 1px dashed #E2E8F0;
      margin-bottom: 10px;
    }

    .loc-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .loc-item-thumb {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      position: relative;
      flex-shrink: 0;
      overflow: hidden;

      .thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .loc-qty-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        background: rgba(15, 23, 42, 0.85);
        color: #FFFFFF;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 4px;
        border-radius: 4px 0 0 0;
      }
    }

    .loc-item-details {
      flex: 1;
      min-width: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .loc-item-title {
      font-size: 12px;
      font-weight: 700;
      color: #1E293B;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .loc-item-pricing {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      flex-shrink: 0;
    }

    .loc-more-pill {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      padding: 2px 4px;
      text-align: right;
    }

    /* ORDER FOOTER */
    .loc-footer {
      display: flex;
      align-items: center;
      padding-top: 4px;
    }

    .loc-total-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .loc-total-label {
      font-size: 11.5px;
      color: #64748B;
      font-weight: 600;
    }

    .loc-grand-price {
      font-size: 14.5px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.2px;
    }

    /* MENU ITEMS */
    .menu-list {
      display: flex;
      flex-direction: column;
    }

    .menu-item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid #F1F5F9;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #F8FAFC;
      }
    }

    .menu-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;

      &.coupon { background: #FEF3C7; }
      &.notif { background: #E0F2FE; }
      &.support { background: #DCFCE7; }
      &.about { background: #F3E8FF; }
    }

    .menu-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .menu-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
    }

    .menu-subtitle {
      font-size: 11px;
      color: #64748B;
      margin-top: 1px;
    }

    .chevron-icon {
      color: #94A3B8;
      flex-shrink: 0;
    }

    /* TOGGLE SWITCH */
    .toggle-switch {
      width: 38px;
      height: 22px;
      background: #CBD5E1;
      border-radius: 9999px;
      padding: 2px;
      cursor: pointer;
      transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;

      &.on {
        background: #0F172A;
      }

      .toggle-knob {
        width: 18px;
        height: 18px;
        background: #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &.on .toggle-knob {
        transform: translateX(16px);
      }
    }

    /* LOGOUT & CONFIRMATION */
    .logout-container {
      margin-top: 6px;
      margin-bottom: 12px;
      position: relative;
    }

    .logout-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 48px;
      background: #FFFFFF;
      border: 1.5px solid #FCA5A5;
      color: #DC2626;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;

      &:hover {
        background: #FEF2F2;
        border-color: #EF4444;
      }
      &:active {
        transform: scale(0.98);
      }
    }

    .logout-confirm-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 48px;
      background: #FEF2F2;
      border: 1.5px solid #F87171;
      border-radius: 12px;
      padding: 0 10px 0 16px;
      box-sizing: border-box;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.12);
    }

    .lcc-question {
      font-size: 13px;
      font-weight: 700;
      color: #991B1B;
      letter-spacing: -0.1px;
    }

    .lcc-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lcc-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      padding: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &.cancel {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        color: #64748B;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

        &:hover {
          background: #F1F5F9;
          color: #0F172A;
          transform: scale(1.08);
        }
        &:active {
          transform: scale(0.92);
        }
      }

      &.confirm {
        background: #DC2626;
        color: #FFFFFF;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);

        &:hover {
          background: #B91C1C;
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.45);
        }
        &:active {
          transform: scale(0.92);
        }
      }
    }

    .animate-pop-in {
      animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease both;
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.94);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* GUEST STATE */
    .guest-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }

    .guest-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      max-width: 340px;
      width: 100%;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      border: 1px solid #E2E8F0;
    }

    .guest-icon-frame {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background: #FEF3C7;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .guest-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 8px;
      font-family: 'Outfit', sans-serif;
    }

    .guest-sub {
      font-size: 13px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 22px;
    }

    .guest-btn {
      width: 100%;
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: #0F172A;
      border: none;
      border-radius: 12px;
      padding: 13px;
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
      }
      &:active {
        transform: scale(0.98);
      }
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
  readonly notificationsEnabled = signal<boolean>(true);
  readonly showLogoutConfirm = signal<boolean>(false);

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

  getProductImage(item: any): string {
    if (item?.productImage && typeof item.productImage === 'string' && item.productImage.trim() !== '' && !item.productImage.includes('undefined')) {
      return item.productImage;
    }
    const products = this.dataService.products();
    const cleanItemName = (item?.productName || '').trim().toLowerCase();
    const match = products.find((p: any) =>
      (p.id && item?.productId && p.id === item.productId) ||
      (p.name && cleanItemName && p.name.trim().toLowerCase() === cleanItemName) ||
      (p.fullName && cleanItemName && p.fullName.trim().toLowerCase().includes(cleanItemName)) ||
      (p.name && cleanItemName && cleanItemName.includes(p.name.trim().toLowerCase()))
    );
    if (match) {
      if ((match as any).image) return (match as any).image;
      if (match.images && match.images.length > 0) return match.images[0];
    }
    return 'assets/images/gift-box.jpg';
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/gift-box.jpg';
    }
  }

  trackOrder(orderId: string): void {
    if (this.inlineMode) {
      this.cartService.closeDrawer();
    }
    this.router.navigate(['/track-order', orderId]);
  }

  formatPhone(p?: string): string {
    if (!p) return '';
    const clean = p.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      return `${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return clean || p;
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

  openAbout(): void {
    if (this.inlineMode) this.cartService.closeDrawer();
    this.router.navigate(['/']);
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
}
