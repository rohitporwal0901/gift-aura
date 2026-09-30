import { Component, inject, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { AdminOrder } from '../../core/models/admin.model';
import { environment } from '../../../environments/environment';
import { MapPickerComponent } from '../../shared/map-picker/map-picker.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, MapPickerComponent],
  template: `
    <div class="checkout-page" [class.inline]="inlineMode">
      <!-- HEADER -->
      <div class="checkout-header" *ngIf="!inlineMode">
        <button class="back-btn" (click)="router.navigate(['/cart'])" aria-label="Back to Cart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Cart</span>
        </button>
        <h2 class="checkout-title">Checkout</h2>
        <div class="header-spacer"></div>
      </div>

      <!-- INLINE HEADER (Drawer Mode) -->
      <div class="inline-header" *ngIf="inlineMode">
        <button class="back-btn" (click)="cartService.setDrawerMode('cart')" aria-label="Back to Cart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Back</span>
        </button>
        <h2 class="checkout-title">Checkout</h2>
        <div class="header-spacer"></div>
      </div>

      <!-- TOAST NOTIFICATION (REPLACES BROWSER ALERT) -->
      @if (toast()) {
        <div class="checkout-toast animate-toast" [class]="'toast-' + toast()!.type">
          <span class="toast-icon">
            {{ toast()!.type === 'warning' ? '📍' : toast()!.type === 'error' ? '❌' : '✅' }}
          </span>
          <span class="toast-text">{{ toast()!.message }}</span>
          <button class="toast-close-btn" (click)="toast.set(null)">✕</button>
        </div>
      }

      <!-- STEPPER -->
      <div class="stepper-wrap">
        <div class="stepper">
          @for (step of steps; track step.num) {
            <div class="step-item" [class.active]="currentStep() >= step.num" [class.current]="currentStep() === step.num">
              <div class="step-circle">
                @if (currentStep() > step.num) {
                  <span>✓</span>
                } @else {
                  <span>{{ step.num }}</span>
                }
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
            @if (step.num < steps.length) {
              <div class="step-line" [class.active]="currentStep() > step.num"></div>
            }
          }
        </div>
      </div>

      <!-- STEP CONTENT -->
      <div class="container step-content">

        @if (cartService.items().length === 0) {
          <div class="empty-cart-pane animate-fadeInUp">
            <div class="empty-icon-bubble">🛒</div>
            <h3 class="empty-heading">Your cart is empty</h3>
            <p class="empty-desc">Please add customized merchandise or corporate gifts to your cart before proceeding.</p>
            <button class="btn-browse-menu" (click)="closeAndNavigate('/menu')">
              Explore Collections 🎁
            </button>
          </div>
        } @else {

        <!-- STEP 1: ADDRESS -->
        @if (currentStep() === 1) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Delivery Address</h3>

            <!-- PICKUP (fixed store) -->
            <div class="addr-block pickup-block">
              <div class="addr-dot green"></div>
              <div class="addr-info">
                <span class="addr-label green-tag">STORE PICKUP</span>
                <p class="addr-main">Corporate Headquarters, Indore</p>
                <span class="addr-sub">GiftAura Printing & Merchandise Hub</span>
              </div>
              <div class="store-badge">🏪 Store</div>
            </div>

            <!-- ROUTE CONNECTOR -->
            <div class="route-separator">
              <div class="route-line-vert"></div>
              @if (cartService.deliveryDistanceKm() > 0) {
                <div class="route-sep-chips">
                  <span class="sep-chip dist">📏 {{ cartService.deliveryDistanceKm() | number:'1.1-1' }} km</span>
                  <span class="sep-chip charge">💰 Delivery ₹{{ cartService.deliveryCharge() }}</span>
                </div>
              } @else {
                <div class="route-sep-chips">
                  <span class="sep-chip pending">Choose delivery point</span>
                </div>
              }
            </div>

            <!-- DROP (user selects) -->
            <div
              class="addr-block drop-block"
              [class.drop-empty]="!cartService.dropDisplayName()"
              [class.pulse-highlight]="pulseDropError()"
            >
              <div class="addr-dot red"></div>
              <div class="addr-info">
                <span class="addr-label red-tag">DELIVERY TO</span>
                <p class="addr-main">{{ cartService.dropDisplayName() || 'Tap to select delivery location' }}</p>
                @if (cartService.dropDisplayName()) {
                  <span class="addr-sub verified">✓ Location confirmed on map</span>
                }
              </div>
              <button class="map-pick-btn" (click)="showMapPicker.set(true)" type="button" id="open-map-btn">
                {{ cartService.dropDisplayName() ? 'Change Location' : 'Select on Map' }}
              </button>
            </div>

            @if (!cartService.dropDisplayName()) {
              <div class="addr-cta-banner" (click)="showMapPicker.set(true)">
                <div class="cta-banner-icon">🗺️</div>
                <div class="cta-banner-text">
                  <p class="cta-banner-title">Select Delivery Location on Map</p>
                  <p class="cta-banner-sub">Tap here to choose your exact drop point in Indore</p>
                </div>
                <span class="cta-banner-arrow">→</span>
              </div>
            }
          </div>
        }

        <!-- MAP PICKER BOTTOM SHEET -->
        @if (showMapPicker()) {
          <app-map-picker
            (locationConfirmed)="onMapLocationConfirmed()"
            (closed)="showMapPicker.set(false)"
          ></app-map-picker>
        }

        <!-- STEP 2: PAYMENT -->
        @if (currentStep() === 2) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Payment Method</h3>
            <div class="payment-options">
              @for (method of paymentMethods; track method.id) {
                <label class="payment-option" [class.selected]="selectedPayment() === method.id" [class.disabled-option]="method.disabled">
                  <input type="radio" name="payment" [value]="method.id" [disabled]="method.disabled" [(ngModel)]="paymentVal" (change)="!method.disabled && selectedPayment.set(method.id)">
                  <div class="payment-radio">
                    <div class="radio-circle" [class.selected]="selectedPayment() === method.id"></div>
                    <div class="payment-info">
                      <span class="method-icon">{{ method.icon }}</span>
                      <div>
                        <div class="name-row">
                          <p class="method-name">{{ method.name }}</p>
                          @if (method.disabled) {
                            <span class="disabled-pill">Temporarily Disabled</span>
                          }
                        </div>
                        <p class="method-sub">{{ method.sub }}</p>
                      </div>
                    </div>
                  </div>
                </label>
              }
            </div>

            <!-- ORDER SUMMARY -->
            <div class="order-summary">
              <h4>Order Summary</h4>
              @for (item of cartService.items(); track item.product.id) {
                <div class="summary-item">
                  <div class="summary-item-left">
                    <img [src]="item.product.image" [alt]="item.product.name" class="summary-img">
                    <div>
                      <p class="summary-name">{{ item.product.name }}</p>
                      <p class="summary-qty">Qty: {{ item.quantity }}</p>
                    </div>
                  </div>
                  <span class="summary-price">₹{{ item.totalPrice }}</span>
                </div>
              }
              <div class="summary-totals">
                <div class="total-row"><span>Item Total</span><span>₹{{ cartService.itemTotal() }}</span></div>
                @if (cartService.discount() > 0) {
                  <div class="total-row discount-row">
                    <span>Discount ({{ cartService.appliedCoupon()?.code }})</span>
                    <span class="discount-val">- ₹{{ cartService.discount() }}</span>
                  </div>
                }
                <div class="total-row"><span>Delivery</span><span>₹{{ cartService.deliveryCharge() }}</span></div>
                <div class="divider"></div>
                <div class="total-row grand"><span>Grand Total</span><span>₹{{ cartService.grandTotal() }}</span></div>
              </div>
            </div>
          </div>
        }

        <!-- STEP 3: CONFIRM -->
        @if (currentStep() === 3) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Confirm Order</h3>
            <div class="confirm-section">
              <div class="confirm-row">
                <span class="confirm-label">🏪 Pickup</span>
                <span class="confirm-val">Atal Dwar, LIG, Indore</span>
              </div>
              <div class="confirm-row">
                <span class="confirm-label">📍 Deliver to</span>
                <span class="confirm-val">{{ address.addressLine1 || 'Indore' }}</span>
              </div>
              <div class="confirm-row">
                <span class="confirm-label">💳 Payment</span>
                <span class="confirm-val">{{ getPaymentName() }}</span>
              </div>
              <div class="confirm-row">
                <span class="confirm-label">🛒 Items</span>
                <span class="confirm-val">{{ cartService.totalItems() }} items</span>
              </div>
              @if (cartService.deliveryDistanceKm() > 0) {
                <div class="confirm-row">
                  <span class="confirm-label">📏 Distance</span>
                  <span class="confirm-val">{{ cartService.deliveryDistanceKm() | number:'1.1-1' }} km</span>
                </div>
              }
              @if (cartService.discount() > 0) {
                <div class="confirm-row discount-row">
                  <span class="confirm-label">🎟️ Coupon ({{ cartService.appliedCoupon()?.code }})</span>
                  <span class="confirm-val discount-val">- ₹{{ cartService.discount() }}</span>
                </div>
              }
              <div class="confirm-row grand-row">
                <span class="confirm-label">💰 Grand Total</span>
                <span class="confirm-total">₹{{ cartService.grandTotal() }}</span>
              </div>
            </div>
          </div>
        }
        }
      </div>

      <!-- CTA BUTTON -->
      @if (cartService.items().length > 0) {
        <div class="checkout-cta">
          @if (currentStep() < 3) {
            <button class="btn-next" (click)="nextStep()">
              {{ currentStep() === 2 ? 'Review Order' : 'Continue' }} →
            </button>
          } @else {
            <button class="btn-place" (click)="placeOrder()" [disabled]="loading()">
              {{ loading() ? 'Placing Order...' : 'Place Order 🎉 (₹' + cartService.grandTotal() + ')' }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page { background: #F8F9FA; min-height: 100vh; position: relative; }

    .checkout-header {
      background: #fff;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 75px 1fr 75px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      @media (min-width: 768px) { top: 72px; }
    }

    .checkout-title {
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
      font-size: 12px;
      font-weight: 700;
      color: #1A1A1A;
      cursor: pointer;
      font-family: inherit;
      padding: 6px 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      justify-self: start;
      transition: all 0.2s;
      &:active { background: #E4E4E7; transform: scale(0.95); }
    }

    .header-spacer { width: 75px; justify-self: end; }

    /* TOAST NOTIFICATION */
    .checkout-toast {
      position: fixed;
      top: 60px;
      left: 16px;
      right: 16px;
      max-width: 440px;
      margin: 0 auto;
      z-index: 1050;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.18);
      font-size: 13px;
      font-weight: 600;
      &.toast-warning {
        background: #FFFBEB;
        border: 1.5px solid #FCD34D;
        color: #92400E;
      }
      &.toast-error {
        background: #FEF2F2;
        border: 1.5px solid #FCA5A5;
        color: #B91C1C;
      }
      &.toast-success {
        background: #F0FDF4;
        border: 1.5px solid #86EFAC;
        color: #166534;
      }
    }
    .toast-icon { font-size: 16px; flex-shrink: 0; }
    .toast-text { flex: 1; line-height: 1.35; }
    .toast-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.65;
      font-size: 13px;
      font-weight: 700;
      padding: 2px 6px;
      &:hover { opacity: 1; }
    }
    @keyframes toastSlide {
      from { opacity: 0; transform: translateY(-16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-toast { animation: toastSlide 0.25s ease-out; }

    /* STEPPER */
    .stepper-wrap { background: #fff; padding: 14px 20px; border-bottom: 1px solid #EEE; }
    .stepper { display: flex; align-items: center; justify-content: center; gap: 0; }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle { width: 28px; height: 28px; border-radius: 50%; background: #EEE; color: #999; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .step-item.active .step-circle { background: #2E7D32; color: #fff; }
    .step-label { font-size: 10px; font-weight: 500; color: #999; white-space: nowrap; }
    .step-item.active .step-label { color: #2E7D32; font-weight: 600; }
    .step-line { height: 2px; width: 60px; background: #EEE; margin: 0 4px; margin-bottom: 20px; transition: background 0.3s; }
    .step-line.active { background: #2E7D32; }

    /* STEP CONTENT */
    .step-content { padding-top: 18px; padding-bottom: 140px; }
    .step-heading { font-size: 17px; font-weight: 800; margin-bottom: 16px; color: #1A1A1A; }

    /* ADDRESS BLOCKS */
    .addr-block {
      background: #fff;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
      transition: all 0.2s;
      &.drop-empty {
        border: 1.5px dashed #CBD5E1;
        background: #FAFAFA;
      }
      &.pulse-highlight {
        animation: pulseRed 0.8s ease-in-out;
        border-color: #EF4444;
      }
    }
    @keyframes pulseRed {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .addr-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      &.green { background: #2E7D32; box-shadow: 0 0 0 4px rgba(46,125,50,0.18); }
      &.red   { background: #E53935; box-shadow: 0 0 0 4px rgba(229,57,53,0.18); }
    }
    .addr-info { flex: 1; min-width: 0; }
    .addr-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      display: block;
      margin-bottom: 2px;
      &.green-tag { color: #2E7D32; }
      &.red-tag { color: #E53935; }
    }
    .addr-main {
      font-size: 13.5px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0;
      line-height: 1.35;
      word-break: break-word;
    }
    .addr-sub {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
      display: block;
      &.verified { color: #15803D; font-weight: 600; }
    }
    .store-badge {
      font-size: 11px;
      font-weight: 700;
      color: #2E7D32;
      background: #E8F5E9;
      padding: 4px 8px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .map-pick-btn {
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 9px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(46,125,50,0.25);
      &:hover { background: #1B5E20; transform: translateY(-1px); }
      &:active { transform: scale(0.97); }
    }

    /* ROUTE CONNECTOR */
    .route-separator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 4px 0 4px 6px;
      padding-left: 14px;
    }
    .route-line-vert {
      width: 2px;
      height: 34px;
      background: #D1D5DB;
      border-radius: 99px;
    }
    .route-sep-chips { display: flex; gap: 6px; flex-shrink: 0; }
    .sep-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      &.dist { background: #EFF6FF; color: #1D4ED8; }
      &.charge { background: #DCFCE7; color: #15803D; }
      &.pending { background: #F3F4F6; color: #6B7280; font-size: 10px; }
    }

    /* CTA BANNER IF NO LOCATION */
    .addr-cta-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #ECFDF5, #F0FDF4);
      border: 1.5px solid #A7F3D0;
      border-radius: 14px;
      padding: 12px 16px;
      margin-top: 14px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        background: #DCFCE7;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(46,125,50,0.12);
      }
    }
    .cta-banner-icon { font-size: 22px; flex-shrink: 0; }
    .cta-banner-text { flex: 1; }
    .cta-banner-title { font-size: 13px; font-weight: 700; color: #166534; margin: 0; }
    .cta-banner-sub { font-size: 11px; color: #4B5563; margin: 2px 0 0; }
    .cta-banner-arrow { font-size: 16px; color: #166534; font-weight: 700; }

    /* PAYMENT */
    .payment-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .payment-option { cursor: pointer; input { display: none; } }
    .payment-radio { background: #fff; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 2px solid transparent; transition: all 0.2s; }
    .payment-option.selected .payment-radio { border-color: #4CAF50; background: #F1F8E9; }
    .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #DDD; transition: all 0.2s; flex-shrink: 0; &.selected { border-color: #2E7D32; border-width: 6px; } }
    .payment-info { display: flex; align-items: center; gap: 12px; }
    .method-icon { font-size: 24px; }
    .method-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .method-sub { font-size: 11px; color: #999; }
    .disabled-option { opacity: 0.6; cursor: not-allowed; }
    .name-row { display: flex; align-items: center; gap: 8px; }
    .disabled-pill { font-size: 9px; font-weight: 700; color: #C62828; background: #FFEBEE; padding: 2px 7px; border-radius: 999px; }

    /* ORDER SUMMARY */
    .order-summary { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); h4 { font-size: 15px; font-weight: 700; margin-bottom: 14px; } }
    .summary-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .summary-item-left { display: flex; align-items: center; gap: 10px; }
    .summary-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
    .summary-name { font-size: 13px; font-weight: 600; }
    .summary-qty { font-size: 11px; color: #999; }
    .summary-price { font-size: 14px; font-weight: 700; }
    .summary-totals { margin-top: 12px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 8px; &.grand { font-size: 16px; font-weight: 800; color: #1A1A1A; } }
    .discount-row { color: #2E7D32; font-weight: 600; }
    .discount-val { color: #2E7D32; font-weight: 700; }
    .divider { height: 1px; background: #EEE; margin: 8px 0; }

    /* CONFIRM */
    .confirm-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .confirm-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #F5F5F5;
      gap: 16px;
      &:last-child { border-bottom: none; align-items: center; }
    }
    .confirm-label {
      font-size: 13px;
      color: #71717A;
      white-space: nowrap;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .confirm-val {
      font-size: 14px;
      font-weight: 600;
      color: #1A1A1A;
      text-align: right;
      word-break: break-word;
      flex: 1;
    }
    .grand-row { align-items: center; }
    .confirm-total { font-size: 20px; font-weight: 800; color: #2E7D32; }

    /* CTA */
    .checkout-cta {
      position: fixed;
      bottom: 0;
      left: 0; right: 0;
      padding: 14px 20px max(18px, env(safe-area-inset-bottom));
      background: #FFFFFF;
      border-top: 1px solid #EEEEEE;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
      z-index: 100;
    }
    .btn-next, .btn-place {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      display: block;
      border: none;
      border-radius: 14px;
      padding: 15px;
      font-family: 'Poppins', sans-serif;
      font-size: 15.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 6px 20px rgba(46,125,50,0.35);
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    .btn-next { background: #2E7D32; color: #fff; &:hover { background: #1B5E20; transform: translateY(-2px); } }
    .btn-place { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: #fff; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(46,125,50,0.45); } }

    /* EMPTY CART */
    .empty-cart-pane {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 40px 24px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      margin: 20px 0;
    }
    .empty-icon-bubble { font-size: 48px; margin-bottom: 12px; }
    .empty-heading { font-size: 18px; font-weight: 800; color: #1F2937; margin: 0 0 6px; }
    .empty-desc { font-size: 13px; color: #6B7280; margin: 0 0 20px; line-height: 1.4; }
    .btn-browse-menu {
      background: #2E7D32;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(46, 125, 50, 0.3);
      transition: all 0.2s;
      &:hover { background: #1B5E20; transform: translateY(-2px); }
    }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeInUp { animation: fadeInUp 0.35s ease both; }
  `]
})
export class CheckoutComponent {
  @Input() inlineMode = false;
  router = inject(Router);
  cartService = inject(CartService);
  authService = inject(AuthService);
  dataService = inject(DataService);

  currentStep     = signal(1);
  loading         = signal(false);
  selectedPayment = signal('upi');
  paymentVal      = 'upi';
  showMapPicker   = signal(false);
  pulseDropError  = signal(false);
  toast           = signal<{ message: string; type: 'warning' | 'error' | 'success' } | null>(null);

  closeAndNavigate(url: string) {
    if (this.inlineMode) {
      this.cartService.closeDrawer();
    }
    const [path, query] = url.split('?');
    if (query) {
      const qParams = Object.fromEntries(new URLSearchParams(query));
      this.router.navigate([path], { queryParams: qParams });
    } else {
      this.router.navigate([path]);
    }
  }

  private toastTimer: any = null;

  address = { 
    name: this.authService.currentUser()?.name || '', 
    phone: this.authService.currentUser()?.phone || '', 
    addressLine1: this.authService.activeAddress().fullAddress || 'Atal Dwar, LIG, Indore', 
    addressLine2: '', 
    city: this.authService.activeAddress().detail || 'Indore', 
    pincode: '452001',
    lat: this.authService.activeAddress().lat || 22.7378,
    lng: this.authService.activeAddress().lng || 75.8867
  };

  constructor() {
    effect(() => {
      const active = this.authService.activeAddress();
      const user = this.authService.currentUser();
      if (user) {
        if (user.name) this.address.name = user.name;
        if (user.phone) this.address.phone = user.phone;
      }
      if (active) {
        this.address.addressLine1 = active.fullAddress;
        this.address.city = active.detail;
        this.address.lat = active.lat || 22.7378;
        this.address.lng = active.lng || 75.8867;
      }
    });
  }

  steps = [
    { num: 1, label: 'Address' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirm' }
  ];

  paymentMethods = [
    { id: 'upi', name: 'Razorpay UPI', icon: '📱', sub: 'Google Pay, PhonePe, Paytm, etc.', disabled: false },
    { id: 'card', name: 'Card / Netbanking', icon: '💳', sub: 'Debit / Credit Card, Netbanking', disabled: false },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', sub: 'Temporarily disabled (Online payment only)', disabled: true }
  ];

  showToast(message: string, type: 'warning' | 'error' | 'success' = 'warning'): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3600);
  }

  nextStep(): void {
    // Step 1 requires drop location to be selected
    if (this.currentStep() === 1 && !this.cartService.dropDisplayName()) {
      this.pulseDropError.set(true);
      setTimeout(() => this.pulseDropError.set(false), 1200);
      this.showToast('📍 Please select your delivery location on the map to continue.', 'warning');
      this.showMapPicker.set(true);
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(v => v + 1);
    }
  }

  onMapLocationConfirmed(): void {
    const drop = this.cartService.dropDisplayName();
    const lat  = this.cartService.dropLat();
    const lng  = this.cartService.dropLng();
    if (drop) {
      this.address.addressLine1 = drop;
      this.address.lat = lat;
      this.address.lng = lng;
      this.showToast('✓ Delivery location updated successfully!', 'success');
    }
  }

  async placeOrder(): Promise<void> {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.loading.set(true);

    const appliedCoupon = this.cartService.appliedCoupon();
    const user = this.authService.currentUser();
    const customerPhone = this.address.phone || user?.phone || '9999999999';

    const grandTotal = this.cartService.grandTotal();
    const orderPayload: Omit<AdminOrder, 'id'> = {
      userId: user?.uid || 'guest',
      customerName: this.address.name || 'Customer',
      customerPhone: customerPhone,
      ...(user?.email ? { customerEmail: user.email } : {}),
      deliveryAddress: {
        name: this.address.name || 'Customer',
        phone: customerPhone,
        addressLine1: this.address.addressLine1 || 'Indore',
        addressLine2: this.address.addressLine2 || '',
        city: this.address.city || 'Indore',
        pincode: this.address.pincode || '452001',
        lat: this.address.lat,
        lng: this.address.lng
      },
      items: this.cartService.items().map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image || 'assets/images/mix-fruit-chaat.jpg',
        quantity: item.quantity,
        price: item.product.price,
        total: item.totalPrice
      })),
      paymentMethod: this.selectedPayment() === 'card' ? 'Card / Online' : 'UPI',
      status: 'confirmed',
      itemTotal: this.cartService.itemTotal(),
      deliveryCharge: this.cartService.deliveryCharge(),
      discount: this.cartService.discount(),
      ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
      grandTotal: grandTotal,
      placedAt: new Date().toISOString()
    };

    const finalizeOrder = async (txnId: string) => {
      try {
        const orderId = await this.dataService.addOrder(orderPayload);
        await this.dataService.addTransaction({
          orderId,
          customerName: orderPayload.customerName,
          customerPhone: orderPayload.customerPhone,
          amount: orderPayload.grandTotal,
          paymentMethod: orderPayload.paymentMethod,
          status: 'success',
          date: new Date().toISOString()
        });

        this.cartService.clearCart();
        this.loading.set(false);
        this.closeAndNavigate('/order-success?orderId=' + orderId);
      } catch (err) {
        console.error('Failed to save order:', err);
        this.loading.set(false);
        this.showToast('Could not place order. Please check your connection.', 'error');
      }
    };

    // Razorpay Integration
    const Razorpay = (window as any).Razorpay;
    const rzpKey = environment.razorpayKey || 'rzp_test_T0ghGBsIrMwMjX';

    if (typeof Razorpay !== 'undefined') {
      try {
        const options = {
          key: rzpKey,
          amount: grandTotal * 100, // in paise
          currency: 'INR',
          name: 'FruitChat',
          description: 'Healthy Fruit & Sprouts Order',
          image: 'assets/images/mix-fruit-chaat.jpg',
          prefill: {
            name: orderPayload.customerName,
            contact: orderPayload.customerPhone,
            email: orderPayload.customerEmail || 'customer@fruitchat.com'
          },
          theme: {
            color: '#2E7D32'
          },
          handler: async (response: any) => {
            await finalizeOrder(response.razorpay_payment_id || ('RZP_' + Date.now()));
          },
          modal: {
            ondismiss: () => {
              this.loading.set(false);
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          this.loading.set(false);
          this.showToast('Payment was not completed. Please try again.', 'error');
        });
        rzp.open();
      } catch (e) {
        // Fallback for placeholder key during development/testing
        await finalizeOrder('TEST_PAY_' + Math.floor(100000 + Math.random() * 900000));
      }
    } else {
      await finalizeOrder('SIM_PAY_' + Math.floor(100000 + Math.random() * 900000));
    }
  }

  getPaymentName(): string {
    return this.paymentMethods.find(m => m.id === this.selectedPayment())?.name ?? 'UPI';
  }
}
