import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AuthModalComponent],
  template: `
    @if (cartService.isOpenDrawer()) {
      <div class="drawer-backdrop" (click)="close()"></div>
      <div class="drawer-panel animate-slide-left">
        @if (authService.authLoading()) {
          <div class="drawer-loading">
            <div class="loader-spinner"></div>
            <p>Loading your session...</p>
          </div>
        } @else if (!authService.isLoggedIn()) {
          <app-auth-modal [inlineMode]="true"></app-auth-modal>
        } @else {
          <!-- DRAWER HEADER -->
          <div class="drawer-header">
          <div class="dh-title">
            <span>Shopping Cart</span>
            <span class="dh-count">({{ cartService.totalItems() }})</span>
          </div>
          <button class="dh-close" (click)="close()" aria-label="Close cart">✕</button>
        </div>

        <!-- FREE SHIPPING BAR -->
        <div class="free-shipping-bar">
          @if (cartService.itemTotal() >= freeShippingThreshold) {
            <div class="fs-text fs-unlocked">
              <span>🎉</span> <strong>Congratulations!</strong> You get FREE SHIPPING across India!
            </div>
            <div class="fs-progress-track">
              <div class="fs-progress-fill" style="width: 100%"></div>
            </div>
          } @else {
            <div class="fs-text">
              Add <strong>₹{{ freeShippingThreshold - cartService.itemTotal() }}</strong> more to enjoy <strong>FREE SHIPPING</strong>!
            </div>
            <div class="fs-progress-track">
              <div class="fs-progress-fill" [style.width.%]="(cartService.itemTotal() / freeShippingThreshold) * 100"></div>
            </div>
          }
        </div>

        <!-- DRAWER CONTENT -->
        <div class="drawer-body">
          @if (cartService.items().length === 0) {
            <div class="empty-drawer">
              <div class="empty-icon">🛍️</div>
              <h3>Your cart is empty</h3>
              <p>Explore our premium corporate collection and customized merchandise.</p>
              <button class="gl-btn-primary" (click)="close()" routerLink="/menu">
                Explore All Products
              </button>
            </div>
          } @else {
            <div class="drawer-items-list">
              @for (item of cartService.items(); track item.product.id) {
                <div class="drawer-item">
                  <div class="di-img-wrap">
                    <img [src]="item.product.image" [alt]="item.product.name" onerror="this.src='https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-corporate-pen-collection_webp.webp?v=1779796661'">
                  </div>
                  <div class="di-info">
                    <div class="di-title-row">
                      <h4 class="di-name">{{ item.product.name }}</h4>
                      <button class="di-remove" (click)="cartService.removeFromCart(item.product.id)" title="Remove item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div class="di-price-row">
                      <span class="di-price">₹{{ item.product.price }}</span>
                      @if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
                        <span class="di-orig">₹{{ item.product.originalPrice }}</span>
                      }
                    </div>
                    <!-- QTY CONTROLS -->
                    <div class="di-actions">
                      <div class="di-qty-box">
                        <button class="di-qty-btn" (click)="cartService.updateQty(item.product.id, item.quantity - 1)">−</button>
                        <span class="di-qty-num">{{ item.quantity }}</span>
                        <button class="di-qty-btn" (click)="cartService.updateQty(item.product.id, item.quantity + 1)">+</button>
                      </div>
                      <span class="di-item-total">₹{{ item.totalPrice }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- DRAWER FOOTER (CHECKOUT) -->
        @if (cartService.items().length > 0) {
          <div class="drawer-footer">
            <!-- PROMO CODE -->
            <div class="promo-box">
              <div class="promo-input-row">
                <input type="text" [(ngModel)]="couponCodeInput" placeholder="Discount code (e.g. FIRST13)" uppercase>
                <button class="promo-apply-btn" (click)="applyPromo()">Apply</button>
              </div>
              @if (promoMessage()) {
                <p class="promo-msg" [class.success]="isPromoSuccess()" [class.error]="!isPromoSuccess()">
                  {{ promoMessage() }}
                </p>
              }
            </div>

            <!-- TOTALS -->
            <div class="summary-rows">
              <div class="sum-row">
                <span>Subtotal</span>
                <span>₹{{ cartService.itemTotal() }}</span>
              </div>
              @if (cartService.discount() > 0) {
                <div class="sum-row discount-row">
                  <span>Discount</span>
                  <span>−₹{{ cartService.discount() }}</span>
                </div>
              }
              <div class="sum-row">
                <span>Estimated Shipping</span>
                <span>{{ cartService.itemTotal() >= freeShippingThreshold ? 'FREE' : '₹15' }}</span>
              </div>
              <div class="sum-row total-row">
                <span>Total</span>
                <span>₹{{ cartService.grandTotal() }}</span>
              </div>
            </div>

            <div class="drawer-buttons">
              <a routerLink="/checkout" (click)="close()" class="gl-btn-primary drawer-checkout-btn">
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a routerLink="/cart" (click)="close()" class="view-cart-link">
                View Full Cart Details
              </a>
            </div>
          </div>
        }
        } <!-- End of else block for isLoggedIn -->
      </div>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);
      z-index: 99998;
    }

    .drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
    }

    .drawer-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: #666;
      font-size: 14px;

      .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top-color: #ffc107;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
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
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .drawer-header {
      padding: 18px 24px;
      border-bottom: 1px solid #eeebe6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #faf8f5;

      .dh-title {
        font-size: 17px;
        font-weight: 800;
        color: #111111;
        display: flex;
        align-items: center;
        gap: 6px;

        .dh-count {
          color: #777777;
          font-weight: 500;
        }
      }

      .dh-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #555555;
        transition: all 0.2s;

        &:hover {
          background: #e8e4df;
          color: #000000;
        }
      }
    }

    .free-shipping-bar {
      background: #fdfaf6;
      padding: 12px 24px;
      border-bottom: 1px solid #eeebe6;

      .fs-text {
        font-size: 12.5px;
        color: #444444;
        margin-bottom: 6px;

        &.fs-unlocked {
          color: #27ae60;
          font-weight: 600;
        }
      }

      .fs-progress-track {
        height: 5px;
        background: #e8e4df;
        border-radius: 999px;
        overflow: hidden;
      }

      .fs-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #a6893b, #27ae60);
        transition: width 0.3s ease;
      }
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    .empty-drawer {
      text-align: center;
      padding: 60px 20px;

      .empty-icon {
        font-size: 50px;
        margin-bottom: 14px;
      }

      h3 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      p {
        color: #777777;
        font-size: 13.5px;
        margin-bottom: 24px;
      }
    }

    .drawer-items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .drawer-item {
      display: flex;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0ece6;

      .di-img-wrap {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        overflow: hidden;
        background: #f7f5f2;
        border: 1px solid #eeebe6;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .di-info {
        flex: 1;
        min-width: 0;
      }

      .di-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 4px;
      }

      .di-name {
        font-size: 13.5px;
        font-weight: 700;
        color: #111111;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .di-remove {
        color: #999999;
        transition: color 0.2s;
        &:hover { color: #e84e4e; }
      }

      .di-price-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;

        .di-price {
          font-weight: 700;
          color: #111111;
          font-size: 14px;
        }

        .di-orig {
          font-size: 12px;
          color: #999999;
          text-decoration: line-through;
        }
      }

      .di-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .di-qty-box {
        display: inline-flex;
        align-items: center;
        border: 1px solid #dcd7cf;
        border-radius: 4px;
        overflow: hidden;
      }

      .di-qty-btn {
        width: 26px;
        height: 26px;
        background: #f9f8f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: #333;
        &:hover { background: #eae5de; }
      }

      .di-qty-num {
        min-width: 24px;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
      }

      .di-item-total {
        font-weight: 800;
        color: #111111;
        font-size: 14px;
      }
    }

    .drawer-footer {
      border-top: 1px solid #eeebe6;
      background: #faf8f5;
      padding: 18px 24px;
    }

    .promo-box {
      margin-bottom: 16px;

      .promo-input-row {
        display: flex;
        gap: 8px;

        input {
          flex: 1;
          border: 1px solid #dcd7cf;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
          background: #ffffff;
          &:focus { border-color: #111111; }
        }

        .promo-apply-btn {
          background: #111111;
          color: #ffffff;
          font-weight: 600;
          font-size: 12px;
          padding: 0 14px;
          border-radius: 6px;
          transition: background 0.2s;
          &:hover { background: #333333; }
        }
      }

      .promo-msg {
        font-size: 11.5px;
        margin-top: 5px;
        &.success { color: #27ae60; font-weight: 600; }
        &.error { color: #e84e4e; }
      }
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;

      .sum-row {
        display: flex;
        justify-content: space-between;
        font-size: 13.5px;
        color: #555555;

        &.discount-row {
          color: #27ae60;
          font-weight: 600;
        }

        &.total-row {
          border-top: 1px solid #e5e1db;
          padding-top: 8px;
          margin-top: 4px;
          font-size: 16px;
          font-weight: 800;
          color: #111111;
        }
      }
    }

    .drawer-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .drawer-checkout-btn {
        width: 100%;
        padding: 14px;
        font-size: 15px;
      }

      .view-cart-link {
        text-align: center;
        font-size: 12.5px;
        color: #666666;
        text-decoration: underline;
        transition: color 0.2s;
        &:hover { color: #111111; }
      }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  freeShippingThreshold = 999;
  couponCodeInput = '';
  promoMessage = signal<string>('');
  isPromoSuccess = signal<boolean>(false);

  close(): void {
    this.cartService.closeDrawer();
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
      this.promoMessage.set(`Coupon FIRST13 applied! Saved ₹${discountAmount}`);
      this.isPromoSuccess.set(true);
    } else if (code === 'GIFT50') {
      this.cartService.applyCoupon({
        code: 'GIFT50',
        discount: 50,
        minOrderAmount: 499
      });
      this.promoMessage.set('Coupon GIFT50 applied! Saved ₹50');
      this.isPromoSuccess.set(true);
    } else {
      this.promoMessage.set('Invalid discount code. Try FIRST13');
      this.isPromoSuccess.set(false);
    }
  }
}
