import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { CheckoutComponent } from '../../pages/checkout/checkout.component';
import { Product } from '../../core/models/product.model';
import { DataService } from '../../core/services/data.service';
import { ProfileComponent } from '../../pages/profile/profile.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AuthModalComponent, CheckoutComponent, ProfileComponent],
  template: `
    @if (cartService.isOpenDrawer()) {
      <div class="drawer-backdrop" (click)="close()" (touchmove)="$event.preventDefault()" (wheel)="$event.preventDefault()"></div>
      <div class="drawer-panel animate-slide-left">
        @if (authService.authLoading()) {
          <div class="drawer-loading">
            <div class="loader-spinner"></div>
            <p>Loading your session...</p>
          </div>
        } @else if (!authService.isLoggedIn()) {
          <app-auth-modal [inlineMode]="true"></app-auth-modal>
        } @else if (cartService.drawerMode() === 'checkout') {
          <app-checkout [inlineMode]="true"></app-checkout>
        } @else if (cartService.drawerMode() === 'profile') {
          <app-profile [inlineMode]="true"></app-profile>
        } @else {
          <!-- CLEAN HEADER -->
          <div class="drawer-header">
            <div class="header-title-box">
              <span class="cart-title">My Cart</span>
              <span class="item-count-chip">{{ cartService.totalItems() }} {{ cartService.totalItems() === 1 ? 'item' : 'items' }}</span>
            </div>
            <button class="close-icon-btn" (click)="close()" aria-label="Close cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- REFINED DELIVERY STRIP -->
          <div class="delivery-strip" [class.is-free]="cartService.itemTotal() >= freeShippingThreshold">
            @if (cartService.itemTotal() >= freeShippingThreshold) {
              <div class="ds-row">
                <span class="ds-icon-bubble">⚡</span>
                <span class="ds-text"><strong>FREE Express Delivery</strong> unlocked on this order!</span>
              </div>
            } @else {
              <div class="ds-column">
                <div class="ds-row">
                  <span class="ds-icon-bubble">🚚</span>
                  <span class="ds-text">Add <strong>₹{{ freeShippingThreshold - cartService.itemTotal() }}</strong> more for <strong>FREE Delivery</strong></span>
                </div>
                <div class="ds-progress-track">
                  <div class="ds-progress-bar" [style.width.%]="(cartService.itemTotal() / freeShippingThreshold) * 100"></div>
                </div>
              </div>
            }
          </div>

          <!-- BODY / ITEMS LIST -->
          <div class="drawer-body">
            @if (cartService.items().length === 0) {
              <div class="empty-state">
                <div class="empty-icon-wrap">🛍️</div>
                <h3 class="empty-head">Your Cart is Empty</h3>
                <p class="empty-sub">Explore our curated collections of premium corporate gifts and customized hampers.</p>
                <button class="empty-shop-btn" (click)="close()" routerLink="/menu">
                  Browse Products
                </button>
              </div>
            } @else {
              <div class="items-list">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="item-card">
                    <!-- PRODUCT IMAGE -->
                    <div class="item-img-wrap">
                      <img [src]="getItemImage(item.product)" [alt]="item.product.name" onerror="this.src='assets/images/gift-box.png'">
                    </div>

                    <!-- PRODUCT INFO -->
                    <div class="item-details">
                      <div class="item-head">
                        <h4 class="item-name" [title]="item.product.name">{{ item.product.name }}</h4>
                        <button class="trash-btn" (click)="cartService.removeFromCart(item.product.id)" title="Remove item" aria-label="Remove item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <!-- PRICING ROW -->
                      <div class="item-pricing">
                        <span class="price-val">₹{{ item.product.price }}</span>
                        @if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
                          <span class="mrp-val">₹{{ item.product.originalPrice }}</span>
                          <span class="discount-pill">{{ getProductOfferText(item.product) }}</span>
                        } @else if (item.product.offerText) {
                          <span class="discount-pill">{{ item.product.offerText }}</span>
                        }
                      </div>

                      <!-- CONTROLS ROW -->
                      <div class="item-controls">
                        <div class="qty-stepper">
                          <button class="step-btn" [disabled]="item.quantity <= 1" (click)="cartService.updateQty(item.product.id, item.quantity - 1)" aria-label="Decrease quantity">−</button>
                          <span class="qty-val">{{ item.quantity }}</span>
                          <button class="step-btn" (click)="cartService.updateQty(item.product.id, item.quantity + 1)" aria-label="Increase quantity">+</button>
                        </div>

                        <span class="item-subtotal">₹{{ item.totalPrice }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- TRUST ASSURANCE PILLS -->
              <div class="cart-trust-bar">
                <div class="ctb-item">
                  <span class="ctb-icon">🛡️</span>
                  <span>100% Quality Assured</span>
                </div>
                <span class="ctb-dot">•</span>
                <div class="ctb-item">
                  <span class="ctb-icon">⚡</span>
                  <span>Fast Dispatch</span>
                </div>
                <span class="ctb-dot">•</span>
                <div class="ctb-item">
                  <span class="ctb-icon">🔒</span>
                  <span>Secure Checkout</span>
                </div>
              </div>
            }
          </div>

          <!-- FOOTER: BILL & CHECKOUT (CLEAN, UNIFIED, COMPACT) -->
          @if (cartService.items().length > 0) {
            <div class="drawer-footer">
              <!-- UNIFIED COUPON SECTION -->
              <div class="promo-section">
                <!-- If Coupon Applied -->
                @if (cartService.appliedCoupon()) {
                  <div class="coupon-applied-bar animate-fade">
                    <div class="cab-left">
                      <span class="cab-icon">🏷️</span>
                      <span class="cab-code">{{ cartService.appliedCoupon()?.code }}</span>
                      <span class="cab-saved">Saved ₹{{ cartService.discount() }}</span>
                    </div>
                    <button type="button" class="cab-remove-btn" (click)="removeCoupon()">Remove ✕</button>
                  </div>
                } @else {
                  <!-- Active Backend Offer Quick Pill -->
                  @if (dataService.offerCard().isActive) {
                    <div class="quick-offer-pill" (click)="applyQuickCoupon(dataService.offerCard().code || '')">
                      <div class="qop-left">
                        <span class="qop-badge">⚡ {{ dataService.offerCard().code }}</span>
                        <span class="qop-text">Save ₹{{ dataService.offerCard().amount }} on orders above ₹{{ dataService.offerCard().minOrderAmount }}</span>
                      </div>
                      <button type="button" class="qop-apply-btn">Apply</button>
                    </div>
                  }

                  <!-- Streamlined Promo Input Bar -->
                  <div class="promo-input-box">
                    <span class="promo-input-icon">🏷️</span>
                    <input 
                      type="text" 
                      [(ngModel)]="couponCodeInput" 
                      placeholder="Enter promo code" 
                      (keyup.enter)="applyPromo()"
                    />
                    <button class="promo-apply-action-btn" (click)="applyPromo()" [disabled]="!couponCodeInput.trim()">
                      Apply
                    </button>
                  </div>
                }

                @if (promoMessage()) {
                  <div class="promo-msg-line" [class.success]="isPromoSuccess()" [class.error]="!isPromoSuccess()">
                    {{ promoMessage() }}
                  </div>
                }
              </div>

              <!-- CLEAN BILL BREAKDOWN -->
              <div class="bill-summary-card">
                <div class="summary-line">
                  <span class="line-label">Items Total (MRP)</span>
                  <span class="line-val">₹{{ totalOriginalPrice() }}</span>
                </div>
                @if (totalSavings() > 0) {
                  <div class="summary-line green">
                    <span class="line-label">Product Savings</span>
                    <span class="line-val">− ₹{{ totalSavings() }}</span>
                  </div>
                }
                @if (cartService.discount() > 0) {
                  <div class="summary-line green">
                    <span class="line-label">Coupon ({{ cartService.appliedCoupon()?.code }})</span>
                    <span class="line-val">− ₹{{ cartService.discount() }}</span>
                  </div>
                }
                <div class="summary-line">
                  <span class="line-label">Delivery Charges</span>
                  @if (cartService.itemTotal() >= freeShippingThreshold) {
                    <span class="line-val free"><s class="strike">₹49</s> FREE</span>
                  } @else {
                    <span class="line-val">₹49</span>
                  }
                </div>

                <div class="bill-divider"></div>

                <div class="summary-line grand-total-line">
                  <span class="grand-label">Grand Total</span>
                  <span class="grand-val">₹{{ cartService.grandTotal() }}</span>
                </div>

                @if (totalSavings() + cartService.discount() > 0) {
                  <div class="savings-alert-pill">
                    ✨ You're saving ₹{{ totalSavings() + cartService.discount() + (cartService.itemTotal() >= freeShippingThreshold ? 49 : 0) }} on this order!
                  </div>
                }
              </div>

              <!-- CHECKOUT SUBMIT BUTTON -->
              <button (click)="cartService.openCheckout()" class="checkout-submit-btn">
                <span>Proceed to Checkout</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          }
        }
      </div>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(3px);
      z-index: 99998;
    }

    .drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 420px;
      background: #FFFFFF;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      box-shadow: -12px 0 40px rgba(0, 0, 0, 0.22);
      border-left: 1px solid rgba(226, 232, 240, 0.8);
      overflow: hidden;
    }

    @media (max-width: 480px) {
      .drawer-panel {
        max-width: 100%;
        border-left: none;
      }
    }

    .drawer-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748B;
      font-size: 13px;

      .loader-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #E2E8F0;
        border-top-color: #0F172A;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 12px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .animate-slide-left {
      animation: slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* HEADER */
    .drawer-header {
      padding: 14px 18px;
      border-bottom: 1px solid #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;

      .header-title-box {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cart-title {
        font-size: 16px;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: -0.2px;
      }

      .item-count-chip {
        background: #F1F5F9;
        color: #475569;
        font-size: 11.5px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
      }

      .close-icon-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid #E2E8F0;
        background: #F8FAFC;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748B;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #E2E8F0;
          color: #0F172A;
        }
      }
    }

    /* COMPACT DELIVERY STRIP */
    .delivery-strip {
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 8px 18px;
      font-size: 12px;
      color: #334155;

      &.is-free {
        background: #ECFDF5;
        border-bottom-color: #D1FAE5;
        color: #065F46;
      }

      .ds-row {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .ds-icon {
        font-size: 14px;
        line-height: 1;
      }

      .ds-text {
        font-size: 12px;
        line-height: 1.35;
      }

      .ds-column {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .ds-progress-track {
        height: 4px;
        background: #E2E8F0;
        border-radius: 999px;
        overflow: hidden;
      }

      .ds-progress-bar {
        height: 100%;
        background: #10B981;
        border-radius: 999px;
        transition: width 0.3s ease;
      }
    }

    /* DRAWER BODY */
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      background: #F8FAFC;
    }

    /* EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 44px 16px;

      .empty-icon-wrap {
        width: 64px;
        height: 64px;
        background: #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        font-size: 28px;
      }

      .empty-head {
        font-size: 16px;
        font-weight: 700;
        color: #0F172A;
        margin: 0 0 6px;
      }

      .empty-sub {
        color: #64748B;
        font-size: 12.5px;
        line-height: 1.45;
        margin: 0 auto 18px;
        max-width: 250px;
      }

      .empty-shop-btn {
        background: #0F172A;
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;

        &:hover {
          background: #1E293B;
        }
      }
    }

    /* ITEMS LIST */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ITEM CARD */
    .item-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 11px;
      padding: 11px 13px;
      display: flex;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.15s ease;

      &:hover {
        border-color: #CBD5E1;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
      }

      .item-img-wrap {
        width: 66px;
        height: 66px;
        border-radius: 9px;
        overflow: hidden;
        background: #F1F5F9;
        flex-shrink: 0;
        border: 1px solid #E2E8F0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .item-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
      }

      .item-name {
        font-size: 13.5px;
        font-weight: 700;
        color: #0F172A;
        margin: 0;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .trash-btn {
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;

        &:hover {
          color: #EF4444;
          background: #FEE2E2;
        }
      }

      /* PRICING ROW */
      .item-pricing {
        display: flex;
        align-items: center;
        gap: 7px;
        margin: 3px 0 6px;
        flex-wrap: wrap;

        .price-val {
          font-size: 14.5px;
          font-weight: 800;
          color: #0F172A;
        }

        .mrp-val {
          font-size: 12px;
          color: #94A3B8;
          text-decoration: line-through;
        }

        .discount-pill {
          font-size: 10.5px;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 1px 6px;
          border-radius: 4px;
          letter-spacing: 0.2px;
        }
      }

      /* CONTROLS ROW */
      .item-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .qty-stepper {
        display: inline-flex;
        align-items: center;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        overflow: hidden;
        height: 27px;
        background: #F8FAFC;
      }

      .step-btn {
        width: 27px;
        height: 100%;
        background: #F8FAFC;
        border: none;
        font-size: 14px;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;

        &:hover:not([disabled]) {
          background: #E2E8F0;
        }

        &[disabled] {
          opacity: 0.35;
          cursor: not-allowed;
        }
      }

      .qty-val {
        min-width: 24px;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        color: #0F172A;
      }

      .item-subtotal {
        font-size: 13.5px;
        font-weight: 800;
        color: #0F172A;
      }
    }

    /* TRUST ASSURANCE BAR */
    .cart-trust-bar {
      margin-top: 14px;
      padding: 9px 12px;
      background: #FFFFFF;
      border: 1px dashed #CBD5E1;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 600;
      color: #64748B;

      .ctb-item {
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .ctb-icon {
        font-size: 12px;
      }

      .ctb-dot {
        color: #CBD5E1;
        font-weight: bold;
      }
    }

    /* FOOTER */
    .drawer-footer {
      background: #FFFFFF;
      border-top: 1px solid #F1F5F9;
      padding: 13px 16px 16px;
      box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* UNIFIED PROMO SECTION */
    .promo-section {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    /* Coupon Applied Banner */
    .coupon-applied-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F0FDF4;
      border: 1px dashed #22C55E;
      border-radius: 8px;
      padding: 7px 11px;

      .cab-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cab-icon {
        font-size: 12px;
      }

      .cab-code {
        font-size: 11px;
        font-weight: 800;
        color: #15803D;
        background: #DCFCE7;
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 0.3px;
      }

      .cab-saved {
        font-size: 11px;
        font-weight: 700;
        color: #166534;
      }

      .cab-remove-btn {
        background: none;
        border: none;
        color: #EF4444;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.15s;

        &:hover {
          background: #FEE2E2;
        }
      }
    }

    /* Quick Offer Pill */
    .quick-offer-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 6px 10px;
      background: #FFFBEB;
      border: 1px dashed #F59E0B;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #FEF3C7;
        border-color: #D97706;
      }

      .qop-left {
        display: flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
      }

      .qop-badge {
        font-size: 10px;
        font-weight: 800;
        color: #B45309;
        background: #FDE68A;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }

      .qop-text {
        font-size: 11px;
        font-weight: 600;
        color: #92400E;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .qop-apply-btn {
        background: #0F172A;
        color: #FFFFFF;
        border: none;
        border-radius: 5px;
        padding: 3px 9px;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s;

        &:hover {
          background: #1E293B;
        }
      }
    }

    /* Streamlined Promo Input Bar */
    .promo-input-box {
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 3px 4px 3px 10px;
      background: #F8FAFC;
      transition: all 0.15s ease;

      &:focus-within {
        border-color: #0F172A;
        background: #FFFFFF;
        box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.05);
      }

      .promo-input-icon {
        font-size: 12px;
        opacity: 0.6;
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 11.5px;
        outline: none;
        color: #0F172A;
        font-weight: 600;
        text-transform: uppercase;

        &::placeholder {
          text-transform: none;
          color: #94A3B8;
          font-weight: 500;
        }
      }

      .promo-apply-action-btn {
        background: #0F172A;
        color: #FFFFFF;
        border: none;
        border-radius: 6px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;

        &:hover:not([disabled]) {
          background: #1E293B;
        }

        &[disabled] {
          opacity: 0.35;
          cursor: not-allowed;
          background: #94A3B8;
        }
      }
    }

    .promo-msg-line {
      font-size: 11px;
      font-weight: 600;
      padding: 0 2px;

      &.success { color: #059669; }
      &.error { color: #DC2626; }
    }

    /* CLEAN BILL SUMMARY CARD */
    .bill-summary-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 13px;
      display: flex;
      flex-direction: column;
      gap: 5px;

      .summary-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #64748B;

        .line-label {
          color: #64748B;
        }

        .line-val {
          font-weight: 600;
          color: #334155;
        }

        &.green {
          color: #059669;
          .line-label { color: #059669; }
          .line-val { color: #059669; font-weight: 700; }
        }

        .line-val.free {
          color: #059669;
          font-weight: 800;
        }

        .strike {
          color: #94A3B8;
          font-weight: 400;
          margin-right: 4px;
        }
      }

      .bill-divider {
        height: 1px;
        background: #E2E8F0;
        margin: 3px 0;
      }

      .grand-total-line {
        margin-top: 1px;

        .grand-label {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.2px;
        }

        .grand-val {
          font-size: 16px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.3px;
        }
      }

      .savings-alert-pill {
        background: #ECFDF5;
        color: #047857;
        border: 1px solid #A7F3D0;
        border-radius: 6px;
        padding: 5px 8px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        margin-top: 4px;
        letter-spacing: 0.1px;
      }
    }

    /* CHECKOUT SUBMIT BUTTON */
    .checkout-submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      height: 44px;
      font-size: 13.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
      transition: all 0.2s ease;

      svg {
        transition: transform 0.2s ease;
      }

      &:hover {
        background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);

        svg {
          transform: translateX(3px);
        }
      }

      &:active {
        transform: translateY(0) scale(0.99);
      }
    }

    .animate-fade {
      animation: fadeIn 0.2s ease-in-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  dataService = inject(DataService);
  router = inject(Router);
  freeShippingThreshold = 999;
  couponCodeInput = '';
  promoMessage = signal<string>('');
  isPromoSuccess = signal<boolean>(false);

  // Computes total MRP based on originalPrice (or price fallback)
  totalOriginalPrice = computed(() => {
    return this.cartService.items().reduce((sum, it) => {
      const orig = it.product.originalPrice && it.product.originalPrice > it.product.price
        ? it.product.originalPrice
        : it.product.price;
      return sum + (orig * it.quantity);
    }, 0);
  });

  // Total savings between MRP and selling price
  totalSavings = computed(() => {
    return Math.max(0, this.totalOriginalPrice() - this.cartService.itemTotal());
  });

  close(): void {
    this.cartService.closeDrawer();
  }

  // Returns clean offer badge e.g. "14% OFF"
  getProductOfferText(product: Product): string {
    if (product.discountPercent) {
      return `${product.discountPercent}% OFF`;
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return `${pct}% OFF`;
    }
    if (product.offerText) {
      return product.offerText;
    }
    return 'Special Offer';
  }

  getItemImage(product: Product): string {
    const p = product as any;
    if (p.image && typeof p.image === 'string' && p.image.trim()) return p.image;
    if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) return p.images[0];
    return 'assets/images/gift-box.png';
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.couponCodeInput = '';
    this.promoMessage.set('');
  }

  applyQuickCoupon(code: string): void {
    this.couponCodeInput = code;
    this.applyPromo();
  }

  applyPromo(): void {
    const code = this.couponCodeInput.trim().toUpperCase();
    if (!code) return;

    const offer = this.dataService.offerCard();
    const itemTotal = this.cartService.itemTotal();

    // Check backend active offer card
    if (offer && offer.isActive && code === (offer.code || '').trim().toUpperCase()) {
      const minAmount = Number(offer.minOrderAmount) || 0;
      if (itemTotal < minAmount) {
        this.promoMessage.set(`Add ₹${minAmount - itemTotal} more to apply code ${offer.code}`);
        this.isPromoSuccess.set(false);
        return;
      }
      this.cartService.applyCoupon({
        code: offer.code || '',
        discount: Number(offer.amount) || 0,
        minOrderAmount: minAmount
      });
      this.promoMessage.set(`Applied! Saved ₹${offer.amount}`);
      this.isPromoSuccess.set(true);
      return;
    }

    if (code === 'FIRST13') {
      const discountAmount = Math.round(itemTotal * 0.13);
      this.cartService.applyCoupon({
        code: 'FIRST13',
        discount: discountAmount,
        minOrderAmount: 0
      });
      this.promoMessage.set(`Applied! Saved ₹${discountAmount}`);
      this.isPromoSuccess.set(true);
      return;
    }

    if (offer && !offer.isActive && code === (offer.code || '').trim().toUpperCase()) {
      this.promoMessage.set('This offer is currently inactive or expired');
      this.isPromoSuccess.set(false);
      return;
    }

    this.promoMessage.set('Invalid discount code');
    this.isPromoSuccess.set(false);
  }
}
