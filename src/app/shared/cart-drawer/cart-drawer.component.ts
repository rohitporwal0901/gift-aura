import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { CheckoutComponent } from '../../pages/checkout/checkout.component';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { Product } from '../../core/models/product.model';

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
          <!-- HEADER -->
          <div class="drawer-header">
            <div class="header-title-box">
              <span class="cart-title">My Cart</span>
              <span class="item-count-chip">{{ cartService.totalItems() }} {{ cartService.totalItems() === 1 ? 'item' : 'items' }}</span>
            </div>
            <button class="close-icon-btn" (click)="close()" aria-label="Close cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- COMPACT DELIVERY STRIP -->
          <div class="delivery-strip" [class.is-free]="cartService.itemTotal() >= freeShippingThreshold">
            @if (cartService.itemTotal() >= freeShippingThreshold) {
              <div class="ds-row">
                <span class="ds-icon">⚡</span>
                <span class="ds-text">Yay! <strong>FREE Express Delivery</strong> unlocked on this order</span>
              </div>
            } @else {
              <div class="ds-column">
                <div class="ds-row">
                  <span class="ds-icon">🚚</span>
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
                      <img [src]="item.product.image" [alt]="item.product.name" onerror="this.src='assets/images/gift-box.png'">
                    </div>

                    <!-- PRODUCT INFO -->
                    <div class="item-details">
                      <div class="item-head">
                        <h4 class="item-name" [title]="item.product.name">{{ item.product.name }}</h4>
                        <button class="trash-btn" (click)="cartService.removeFromCart(item.product.id)" title="Remove item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <!-- PRICE ROW WITH OFFER -->
                      <div class="item-pricing">
                        <span class="price-val">₹{{ item.product.price }}</span>
                        @if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
                          <span class="mrp-val">₹{{ item.product.originalPrice }}</span>
                          <span class="discount-pill">{{ getProductOfferText(item.product) }}</span>
                        } @else if (item.product.offerText) {
                          <span class="discount-pill">{{ item.product.offerText }}</span>
                        }
                      </div>

                      <!-- FOOTER ROW: STEPPER & SUBTOTAL -->
                      <div class="item-controls">
                        <div class="qty-stepper">
                          <button class="step-btn" [disabled]="item.quantity <= 1" (click)="cartService.updateQty(item.product.id, item.quantity - 1)">−</button>
                          <span class="qty-val">{{ item.quantity }}</span>
                          <button class="step-btn" (click)="cartService.updateQty(item.product.id, item.quantity + 1)">+</button>
                        </div>

                        <span class="item-subtotal">₹{{ item.totalPrice }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- FOOTER: BILL & CHECKOUT (CLEAN & COMPACT) -->
          @if (cartService.items().length > 0) {
            <div class="drawer-footer">
              <!-- COMPACT PROMO ROW -->
              <div class="promo-section">
                <div class="promo-bar">
                  <span class="promo-icon">🏷️</span>
                  <input type="text" [(ngModel)]="couponCodeInput" placeholder="Discount code (e.g. FIRST13)" uppercase>
                  <button class="promo-btn" (click)="applyPromo()">Apply</button>
                </div>
                <div class="promo-hint-row">
                  <button type="button" class="quick-code-btn" (click)="applyQuickCoupon('FIRST13')">
                    Apply <strong>FIRST13</strong> (13% OFF)
                  </button>
                  @if (promoMessage()) {
                    <span class="promo-status" [class.success]="isPromoSuccess()" [class.error]="!isPromoSuccess()">
                      {{ promoMessage() }}
                    </span>
                  }
                </div>
              </div>

              <!-- CLEAN BILL DETAILS -->
              <div class="bill-summary">
                <div class="summary-line">
                  <span class="line-label">Items Total</span>
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

                <div class="summary-line total-line">
                  <span class="line-label total-label">Grand Total</span>
                  <span class="line-val total-val">₹{{ cartService.grandTotal() }}</span>
                </div>

                @if (totalSavings() + cartService.discount() > 0) {
                  <div class="savings-alert">
                    ✨ You're saving ₹{{ totalSavings() + cartService.discount() + (cartService.itemTotal() >= freeShippingThreshold ? 49 : 0) }} on this order!
                  </div>
                }
              </div>

              <!-- CHECKOUT BUTTON -->
              <button (click)="cartService.openCheckout()" class="checkout-submit-btn">
                <span>Proceed to Checkout</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
      max-width: 410px;
      background: #FFFFFF;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.18);
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
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      transition: border-color 0.15s;

      &:hover {
        border-color: #CBD5E1;
      }

      .item-img-wrap {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        overflow: hidden;
        background: #F1F5F9;
        flex-shrink: 0;
        border: 1px solid #F1F5F9;

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
        font-size: 13px;
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
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s;

        &:hover {
          color: #EF4444;
        }
      }

      /* PRICING ROW */
      .item-pricing {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 3px 0 6px;
        flex-wrap: wrap;

        .price-val {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
        }

        .mrp-val {
          font-size: 11.5px;
          color: #94A3B8;
          text-decoration: line-through;
        }

        .discount-pill {
          font-size: 10.5px;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          padding: 1px 5px;
          border-radius: 4px;
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
        border-radius: 5px;
        overflow: hidden;
        height: 24px;
      }

      .step-btn {
        width: 24px;
        height: 100%;
        background: #F8FAFC;
        border: none;
        font-size: 13px;
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
        min-width: 22px;
        text-align: center;
        font-size: 11.5px;
        font-weight: 700;
        color: #0F172A;
      }

      .item-subtotal {
        font-size: 13px;
        font-weight: 800;
        color: #0F172A;
      }
    }

    /* FOOTER */
    .drawer-footer {
      background: #FFFFFF;
      border-top: 1px solid #E2E8F0;
      padding: 12px 16px;
      box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.04);
    }

    /* PROMO */
    .promo-section {
      margin-bottom: 10px;

      .promo-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        padding: 3px 6px 3px 8px;
        background: #F8FAFC;

        .promo-icon {
          font-size: 12px;
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 11.5px;
          outline: none;
          color: #0F172A;
          font-weight: 600;
        }

        .promo-btn {
          background: #0F172A;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;

          &:hover {
            background: #1E293B;
          }
        }
      }

      .promo-hint-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
      }

      .quick-code-btn {
        background: none;
        border: none;
        color: #475569;
        font-size: 11px;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;

        strong {
          color: #0F172A;
        }

        &:hover {
          color: #0F172A;
        }
      }

      .promo-status {
        font-size: 11px;
        font-weight: 600;

        &.success { color: #059669; }
        &.error { color: #DC2626; }
      }
    }

    /* BILL SUMMARY */
    .bill-summary {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 9px 12px;
      margin-bottom: 10px;

      .summary-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #475569;
        margin-bottom: 4px;

        &.green {
          color: #059669;
          font-weight: 600;
        }

        &.total-line {
          margin-bottom: 0;
          margin-top: 6px;
        }

        .line-val.free {
          color: #059669;
          font-weight: 700;
        }

        .strike {
          color: #94A3B8;
          font-weight: 400;
          margin-right: 3px;
        }

        .total-label {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
        }

        .total-val {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }
      }

      .bill-divider {
        height: 1px;
        background: #E2E8F0;
        margin: 5px 0;
      }

      .savings-alert {
        background: #DCFCE7;
        color: #065F46;
        border-radius: 5px;
        padding: 4px 6px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        margin-top: 6px;
      }
    }

    /* CHECKOUT SUBMIT BUTTON */
    .checkout-submit-btn {
      width: 100%;
      background: #0F172A;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      height: 42px;
      font-size: 13.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.2);
      transition: all 0.15s;

      &:hover {
        background: #1E293B;
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.99);
      }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
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

  // Returns clean offer text e.g. "13% off on ₹1599" or backend text
  getProductOfferText(product: Product): string {
    if (product.offerText) {
      return product.offerText;
    }
    if (product.discountPercent) {
      return `${product.discountPercent}% off on ₹${product.price}`;
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return `${pct}% off on ₹${product.price}`;
    }
    return 'Special Offer';
  }

  applyQuickCoupon(code: string): void {
    this.couponCodeInput = code;
    this.applyPromo();
  }

  applyPromo(): void {
    const code = this.couponCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRST13') {
      const discountAmount = Math.round(this.cartService.itemTotal() * 0.13);
      this.cartService.applyCoupon({
        code: 'FIRST13',
        discount: discountAmount,
        minOrderAmount: 0
      });
      this.promoMessage.set(`Applied! Saved ₹${discountAmount}`);
      this.isPromoSuccess.set(true);
    } else if (code === 'GIFT50') {
      this.cartService.applyCoupon({
        code: 'GIFT50',
        discount: 50,
        minOrderAmount: 499
      });
      this.promoMessage.set('Applied! Saved ₹50');
      this.isPromoSuccess.set(true);
    } else {
      this.promoMessage.set('Invalid code');
      this.isPromoSuccess.set(false);
    }
  }
}
