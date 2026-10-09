import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfettiService } from '../../core/services/confetti.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="cart-page">
      <!-- HEADER -->
      <div class="cart-header">
        <button class="back-btn" (click)="router.navigate(['/menu'])" aria-label="Back to Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 class="cart-title">My Cart</h2>
        <div class="header-right-slot">
          @if (cartService.totalItems() > 0) {
            <button class="clear-btn" (click)="clearCart()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Clear</span>
            </button>
          }
        </div>
      </div>

      @if (cartService.items().length === 0) {
        <!-- EMPTY CART -->
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to your cart!</p>
          <a routerLink="/menu" class="btn-primary">Browse Menu</a>
        </div>
      } @else {
        <!-- CART ITEMS -->
        <div class="container">
          <div class="cart-items-section">
            @for (item of cartService.items(); track item.product.id) {
              <div class="cart-item animate-fadeInUp">
                <img [src]="item.product.image" [alt]="item.product.name" class="item-img">
                <div class="item-info">
                  <h4 class="item-name">{{ item.product.name }}</h4>
                  @if (item.selectedCustomizations.length > 0) {
                    <p class="item-customs">{{ item.selectedCustomizations.join(', ') }}</p>
                  }
                  <span class="item-price">₹{{ item.product.price }}</span>
                </div>
                <div class="item-actions">
                  <button class="del-btn" (click)="remove(item.product.id)">🗑️</button>
                  <div class="mini-stepper">
                    <button class="step-btn" (click)="decrease(item.product.id, item.quantity)">−</button>
                    <span class="step-val">{{ item.quantity }}</span>
                    <button class="step-btn" (click)="increase(item.product.id, item.quantity)">+</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- COUPON SECTION -->
          <div class="coupon-section">
            @if (cartService.appliedCoupon(); as applied) {
              <!-- Applied Coupon Banner -->
              <div class="coupon-applied-box">
                <div class="coupon-applied-left">
                  <div class="badge-row">
                    <span class="coupon-badge">🎉 COUPON APPLIED</span>
                    <span class="coupon-code-pill">{{ applied.code }}</span>
                  </div>
                  <div class="coupon-applied-details">
                    @if (cartService.discount() > 0) {
                      <span class="coupon-saving-text">You save ₹{{ cartService.discount() }} on this order!</span>
                    } @else {
                      <span class="coupon-pending-text">Add ₹{{ (applied.minOrderAmount || 0) - cartService.itemTotal() }} more to activate ₹{{ applied.discount }} OFF (Min order ₹{{ applied.minOrderAmount }})</span>
                    }
                  </div>
                </div>
                <button class="remove-coupon-btn" (click)="removeCoupon()" title="Remove coupon">✕ Remove</button>
              </div>
            } @else {
              <!-- Coupon Input Form -->
              <div class="coupon-input-wrap">
                <span class="coupon-icon">🎟️</span>
                <input type="text" class="coupon-input" [placeholder]="'Enter code (e.g. ' + ((dataService.offerCard().code || 'FRUIT50') | uppercase) + ')'" [(ngModel)]="couponCode" (keyup.enter)="applyCoupon()">
                <button class="apply-btn" (click)="applyCoupon()">Apply</button>
              </div>

              @if (dataService.offerCard().isActive !== false) {
                <!-- Quick hint/tap to apply active offer -->
                <div class="quick-coupon-hint" (click)="quickApplyActiveOffer()">
                  <div class="hint-pill">
                    <span class="spark">⚡</span>
                    <span class="code">{{ (dataService.offerCard().code || 'FRUIT50').toUpperCase() }}</span>
                  </div>
                  <span class="hint-text">
                    Get <strong>₹{{ dataService.offerCard().amount || 50 }} OFF</strong> on orders above <strong>₹{{ dataService.offerCard().minOrderAmount || 99 }}</strong>
                  </span>
                  <span class="tap-apply">Apply →</span>
                </div>
              }
            }

            @if (couponError()) {
              <div class="coupon-alert error">
                <span class="alert-icon">⚠️</span>
                <span>{{ couponError() }}</span>
              </div>
            }
            @if (couponSuccess()) {
              <div class="coupon-alert success">
                <span class="alert-icon">✅</span>
                <span>{{ couponSuccess() }}</span>
              </div>
            }
          </div>

          <!-- BILL SUMMARY -->
          <div class="bill-section">
            <h3 class="bill-title">Bill Summary</h3>
            <div class="bill-rows">
              <div class="bill-row">
                <span>Item Total</span>
                <span>₹{{ cartService.itemTotal() }}</span>
              </div>
              @if (cartService.discount() > 0) {
                <div class="bill-row discount">
                  <span>Discount ({{ cartService.appliedCoupon()?.code }})</span>
                  <span class="discount-val">- ₹{{ cartService.discount() }}</span>
                </div>
              }
              <div class="bill-row">
                <span class="delivery-label-wrap">
                  Delivery Charges
                  @if (!cartService.dropDisplayName()) {
                    <span class="delivery-note">(select location)</span>
                  }
                </span>
                <span class="delivery-charge" [class.delivery-pending]="!cartService.dropDisplayName()">
                  @if (cartService.dropDisplayName()) {
                    ₹{{ cartService.deliveryCharge() }}
                  } @else {
                    ₹15+
                  }
                </span>
              </div>
              <div class="divider"></div>
              <div class="bill-row total">
                <span>Grand Total</span>
                <span>₹{{ cartService.grandTotal() }}</span>
              </div>
            </div>
          </div>

          <!-- DELIVERY INFO -->
          <div class="delivery-info">
            <span class="delivery-icon">🚴</span>
            <p>Estimated delivery: <strong>25-30 minutes</strong></p>
          </div>
        </div>

        <!-- CTA -->
        <div class="cart-cta">
          <button class="btn-checkout" (click)="router.navigate(['/checkout'])">
            Proceed to Checkout →
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page { background: #F8F9FA; min-height: 100vh; }

    .cart-header {
      background: #fff;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 60px 1fr 60px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      @media (min-width: 768px) { top: 72px; }
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F4F4F5;
      border: none;
      color: #1A1A1A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      justify-self: start;
      transition: all 0.2s;
      &:active { background: #E4E4E7; transform: scale(0.95); }
    }

    .cart-title {
      font-size: 18px;
      font-weight: 800;
      text-align: center;
      color: #1A1A1A;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .header-right-slot {
      justify-self: end;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .clear-btn {
      background: #FFF3E0;
      border: 1px solid #FFE0B2;
      font-size: 11px;
      color: #E65100;
      cursor: pointer;
      font-family: inherit;
      font-weight: 700;
      padding: 5px 9px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
      &:hover { background: #FFE0B2; }
      &:active { transform: scale(0.96); }
    }

    /* EMPTY */
    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
      gap: 12px;
      .empty-icon { font-size: 72px; }
      h3 { font-size: 20px; font-weight: 700; color: var(--navy-deep); }
      p { color: var(--muted); font-size: 14px; }
      .btn-primary { margin-top: 8px; padding: 14px 36px; background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%); color: #fff; border-radius: 999px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(169, 124, 67, 0.3); }
    }

    /* CART ITEMS */
    .cart-items-section {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cart-item {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid var(--line);
      box-shadow: 0 2px 8px rgba(15, 30, 44, 0.04);
    }

    .item-img {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;
      .item-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; color: var(--ink); }
      .item-customs { font-size: 11px; color: var(--muted); margin-bottom: 5px; }
      .item-price { font-size: 15px; font-weight: 700; color: var(--navy); }
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .del-btn {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;
      &:hover { opacity: 1; }
    }

    .mini-stepper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--paper-2);
      border-radius: 8px;
      padding: 4px 8px;
      border: 1.5px solid var(--brass);
    }

    .step-btn {
      width: 24px; height: 24px;
      border-radius: 6px;
      background: var(--navy);
      color: #fff;
      border: none;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      line-height: 1;
      font-family: inherit;
      &:hover { background: var(--navy-deep); }
    }

    .step-val { font-weight: 700; font-size: 14px; color: var(--navy); min-width: 16px; text-align: center; }

    /* COUPON */
    .coupon-section {
      margin-top: 16px;
      background: #fff;
      border-radius: 14px;
      padding: 12px 14px;
      box-shadow: 0 2px 8px rgba(15,30,44,0.04);
      border: 1px dashed var(--line);
    }

    .coupon-applied-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--navy-soft);
      border: 1.5px solid rgba(2, 74, 123, 0.25);
      padding: 10px 14px;
      border-radius: 10px;
    }

    .coupon-applied-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .coupon-badge {
      font-size: 10px;
      font-weight: 800;
      color: var(--navy);
      letter-spacing: 0.5px;
    }

    .coupon-code-pill {
      background: var(--brass);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .coupon-applied-details {
      font-size: 12px;
    }

    .coupon-saving-text {
      color: var(--c-ok);
      font-weight: 700;
    }

    .coupon-pending-text {
      color: var(--c-warn);
      font-weight: 600;
      font-size: 11px;
    }

    .remove-coupon-btn {
      background: #FFEBEE;
      border: 1px solid #FFCDD2;
      color: var(--c-bad);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 5px 9px;
      border-radius: 6px;
      font-family: inherit;
      transition: all 0.2s;
      flex-shrink: 0;
      &:hover { background: #FFCDD2; }
    }

    .coupon-input-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;

      .coupon-icon {
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
      }

      .coupon-input {
        flex: 1 1 0%;
        min-width: 0;
        width: 100%;
        border: none;
        outline: none;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink);
        background: transparent;

        &::placeholder {
          color: #9CA3AF;
          font-weight: 500;
        }
      }

      .apply-btn {
        flex-shrink: 0;
        background: var(--brass);
        border: none;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        cursor: pointer;
        font-family: inherit;
        padding: 7px 15px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(169, 124, 67, 0.25);
        transition: all 0.2s;

        &:hover {
          background: var(--color-accent-hover);
          box-shadow: 0 3px 8px rgba(169, 124, 67, 0.35);
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }

    .quick-coupon-hint {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed var(--line);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 11px;
      color: var(--muted);
      transition: all 0.2s;

      &:hover {
        opacity: 0.85;
      }

      .hint-pill {
        background: var(--brass-soft);
        border: 1px solid rgba(169, 124, 67, 0.3);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 800;
        color: var(--brass);
        font-size: 10px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }

      .hint-text {
        flex: 1;
        line-height: 1.3;
      }

      .tap-apply {
        color: var(--navy);
        font-weight: 800;
        flex-shrink: 0;
      }
    }

    .coupon-alert {
      margin-top: 8px;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;

      &.error {
        background: #FFEBEE;
        color: var(--c-bad);
      }

      &.success {
        background: rgba(76, 138, 119, 0.12);
        color: var(--c-ok);
      }
    }

    /* BILL */
    .bill-section {
      margin-top: 16px;
      background: #fff;
      border-radius: 14px;
      padding: 16px;
      border: 1px solid var(--line);
      box-shadow: 0 2px 8px rgba(15,30,44,0.04);
    }

    .bill-title { font-size: 15px; font-weight: 700; color: var(--navy-deep); margin-bottom: 14px; }

    .bill-rows { display: flex; flex-direction: column; gap: 10px; }

    .bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--ink-2);

      &.total { font-size: 16px; font-weight: 800; color: var(--ink); }
      &.discount { color: var(--c-ok); font-weight: 600; }
      .discount-val { color: var(--c-ok); font-weight: 700; }
      .delivery-charge { color: var(--ink); font-weight: 600; }
      .delivery-charge.delivery-pending { color: var(--muted); font-weight: 500; }
      .delivery-label-wrap { display: flex; flex-direction: column; gap: 1px; }
      .delivery-note { font-size: 10px; color: var(--muted); font-weight: 400; }
    }

    .divider { height: 1px; background: var(--line); margin: 2px 0; }

    /* DELIVERY INFO */
    .delivery-info {
      margin-top: 12px;
      background: var(--navy-soft);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--navy);
      margin-bottom: 100px;
      .delivery-icon { font-size: 20px; }
    }

    /* CTA */
    .cart-cta {
      position: fixed;
      bottom: 80px;
      left: 0; right: 0;
      padding: 12px 20px;
      background: linear-gradient(to top, var(--paper) 80%, transparent);
      @media (min-width: 768px) { bottom: 0; }
    }

    .btn-checkout {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      display: block;
      background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%);
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 16px;
      font-family: inherit;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 6px 20px rgba(169, 124, 67, 0.35);
      &:hover { background: linear-gradient(135deg, #B58A50 0%, #8E6633 50%, #724E20 100%); transform: translateY(-2px); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeInUp { animation: fadeInUp 0.35s ease both; }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  dataService = inject(DataService);
  authService = inject(AuthService);
  confettiService = inject(ConfettiService);
  router = inject(Router);

  couponCode = '';
  couponError = signal('');
  couponSuccess = signal('');

  increase(id: string, qty: number): void { this.cartService.updateQty(id, qty + 1); }
  decrease(id: string, qty: number): void { this.cartService.updateQty(id, qty - 1); }
  remove(id: string): void { this.cartService.removeFromCart(id); }
  clearCart(): void { this.cartService.clearCart(); }

  applyCoupon(): void {
    this.couponError.set('');
    this.couponSuccess.set('');
    const code = this.couponCode.trim().toUpperCase();
    if (!code) {
      this.couponError.set('Please enter a coupon code.');
      return;
    }

    const offer = this.dataService.offerCard();
    const activeCode = (offer.code || 'FRUIT50').trim().toUpperCase();

    if (code !== activeCode) {
      this.couponError.set('Invalid coupon code.');
      return;
    }

    // Check if already applied to this order
    const alreadyApplied = this.cartService.appliedCoupon();
    if (alreadyApplied?.code === code) {
      this.couponError.set(`Coupon "${code}" is already applied to this order.`);
      return;
    }

    const minAmount = offer.minOrderAmount || 0;
    const discountAmt = offer.amount || 50;
    const itemTotal = this.cartService.itemTotal();

    if (itemTotal < minAmount) {
      const diff = minAmount - itemTotal;
      this.couponError.set(`Add items worth ₹${diff} more to activate this offer (Min order ₹${minAmount}).`);
      return;
    }

    // Apply coupon to this order
    this.cartService.applyCoupon({
      code,
      discount: discountAmt,
      minOrderAmount: minAmount
    });
    this.confettiService.launch();
    this.couponSuccess.set(`Coupon ${code} applied successfully! You save ₹${discountAmt}.`);
    this.couponCode = '';
  }

  quickApplyActiveOffer(): void {
    const offer = this.dataService.offerCard();
    const activeCode = (offer.code || 'FRUIT50').trim().toUpperCase();
    this.couponCode = activeCode;
    this.applyCoupon();
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.couponSuccess.set('');
    this.couponError.set('');
  }
}
