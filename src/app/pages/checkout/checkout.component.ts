import { Component, inject, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { AdminOrder } from '../../core/models/admin.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-page" [class.inline]="inlineMode">

      <!-- HEADER -->
      <div class="checkout-header">
        <button type="button" class="back-btn" (click)="goBack()" aria-label="Back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        </button>
        <span class="header-title">Checkout</span>
        @if (inlineMode) {
          <button type="button" class="close-icon-btn" (click)="cartService.closeDrawer()" aria-label="Close checkout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        } @else {
          <div class="header-spacer"></div>
        }
      </div>

      <!-- TOAST -->
      @if (toast()) {
        <div class="toast animate-toast" [class]="'toast-' + toast()!.type">
          <span class="toast-icon">{{ toast()!.type === 'warning' ? '⚠️' : toast()!.type === 'error' ? '❌' : '✅' }}</span>
          <span class="toast-text">{{ toast()!.message }}</span>
          <button class="toast-close" (click)="toast.set(null)">✕</button>
        </div>
      }

      <!-- STEPPER -->
      <div class="stepper-bar">
        @for (step of steps; track step.num) {
          <div class="step" [class.active]="currentStep() >= step.num" [class.done]="currentStep() > step.num"
               [class.clickable]="currentStep() > step.num"
               (click)="goToStep(step.num)">
            <div class="step-dot">
              @if (currentStep() > step.num) {
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              } @else {
                {{ step.num }}
              }
            </div>
            <span class="step-name">{{ step.label }}</span>
          </div>
          @if (step.num < steps.length) {
            <div class="step-line" [class.active]="currentStep() > step.num"></div>
          }
        }
      </div>

      <!-- CONTENT AREA -->
      <div class="content-scroll">
        @if (cartService.items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🛒</div>
            <h3>Cart is Empty</h3>
            <p>Add products before checking out</p>
            <button class="btn-browse" (click)="closeAndNavigate('/')">Explore Collections →</button>
          </div>
        } @else {

          <!-- STEP 1: ADDRESS -->
          @if (currentStep() === 1) {
            <div class="step-body animate-in">
              <div class="step-section-title">
                <div class="step-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                Delivery Address
              </div>

              <form class="address-form" #addrForm="ngForm">
                <!-- Name + Phone row -->
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">FULL NAME</label>
                    <input type="text" name="name" [(ngModel)]="address.name" placeholder="e.g. Rohit Sharma"
                      [class.error]="pulseDropError() && !address.name"/>
                  </div>
                  <div class="form-field">
                    <label class="field-label">MOBILE</label>
                    <input type="tel" name="phone" [(ngModel)]="address.phone" placeholder="10-digit number"
                      [class.error]="pulseDropError() && !address.phone"/>
                  </div>
                </div>

                <div class="form-field pincode-field">
                  <label class="field-label">PINCODE</label>
                  <input type="text" name="pincode" [(ngModel)]="address.pincode" placeholder="e.g. 452001"
                    [class.error]="pulseDropError() && !address.pincode" maxlength="6"/>
                </div>

                <div class="form-field">
                  <label class="field-label">FLAT / BUILDING / COMPANY</label>
                  <input type="text" name="addressLine1" [(ngModel)]="address.addressLine1" placeholder="Flat No., Building Name"
                    [class.error]="pulseDropError() && !address.addressLine1"/>
                </div>

                <div class="form-field">
                  <label class="field-label">AREA / STREET / SECTOR</label>
                  <input type="text" name="addressLine2" [(ngModel)]="address.addressLine2" placeholder="Colony, Sector, Village"
                    [class.error]="pulseDropError() && !address.addressLine2"/>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">CITY</label>
                    <input type="text" name="city" [(ngModel)]="address.city" placeholder="e.g. Indore"
                      [class.error]="pulseDropError() && !address.city"/>
                  </div>
                  <div class="form-field">
                    <label class="field-label">STATE</label>
                    <select name="state" [(ngModel)]="address.state" [class.error]="pulseDropError() && !address.state">
                      <option value="" disabled>Select</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          }

          <!-- STEP 2: PAYMENT -->
          @if (currentStep() === 2) {
            <div class="step-body animate-in">

              <!-- ORDER SUMMARY COMPACT -->
              <div class="summary-compact">
                <div class="summary-compact-inner">
                  @for (item of cartService.items(); track item.product.id) {
                    <div class="sc-item">
                      <img [src]="item.product.image" [alt]="item.product.name" class="sc-img"/>
                      <div class="sc-info">
                        <span class="sc-name">{{ item.product.name }}</span>
                        <span class="sc-qty">Qty: {{ item.quantity }}</span>
                      </div>
                      <span class="sc-price">₹{{ item.totalPrice }}</span>
                    </div>
                  }
                  <div class="sc-total-row">
                    <span>Item Total</span><span>₹{{ cartService.itemTotal() }}</span>
                  </div>
                  @if (cartService.discount() > 0) {
                    <div class="sc-total-row green">
                      <span>Discount ({{ cartService.appliedCoupon()?.code }})</span>
                      <span>– ₹{{ cartService.discount() }}</span>
                    </div>
                  }
                  <div class="sc-total-row">
                    <span>Delivery</span><span>₹{{ cartService.deliveryCharge() }}</span>
                  </div>
                  <div class="sc-total-row grand">
                    <span>Grand Total</span><span>₹{{ cartService.grandTotal() }}</span>
                  </div>
                </div>
              </div>

              <!-- PAYMENT OPTIONS -->
              <div class="step-section-title" style="margin-top: 16px;">
                <div class="step-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                Payment Method
              </div>

              <div class="payment-list">
                @for (method of paymentMethods; track method.id) {
                  <label class="payment-card" [class.selected]="selectedPayment() === method.id" [class.disabled]="method.disabled">
                    <input type="radio" name="payment" [value]="method.id" [disabled]="method.disabled"
                      [(ngModel)]="paymentVal" (change)="!method.disabled && selectedPayment.set(method.id)"/>
                    <div class="radio-dot" [class.active]="selectedPayment() === method.id"></div>
                    <div class="method-icon-wrap">{{ method.icon }}</div>
                    <div class="method-info">
                      <div class="method-name">
                        {{ method.name }}
                        @if (method.disabled) {
                          <span class="disabled-tag">Unavailable</span>
                        }
                      </div>
                      <div class="method-sub">{{ method.sub }}</div>
                    </div>
                    @if (selectedPayment() === method.id) {
                      <div class="selected-tick">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    }
                  </label>
                }
              </div>
            </div>
          }

          <!-- STEP 3: CONFIRM -->
          @if (currentStep() === 3) {
            <div class="step-body animate-in">
              <div class="step-section-title">
                <div class="step-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                Review Your Order
              </div>

              <div class="confirm-card">
                <div class="confirm-row">
                  <span class="cf-label">Name</span>
                  <span class="cf-val">{{ address.name }}</span>
                </div>
                <div class="confirm-row">
                  <span class="cf-label">Phone</span>
                  <span class="cf-val">{{ address.phone }}</span>
                </div>
                <div class="confirm-row">
                  <span class="cf-label">Deliver To</span>
                  <span class="cf-val">{{ address.addressLine1 }}, {{ address.addressLine2 }}, {{ address.city }} - {{ address.pincode }}, {{ address.state }}</span>
                </div>
                <div class="confirm-row">
                  <span class="cf-label">Payment</span>
                  <span class="cf-val">{{ getPaymentName() }}</span>
                </div>
                <div class="confirm-row">
                  <span class="cf-label">Items</span>
                  <span class="cf-val">{{ cartService.totalItems() }} item{{ cartService.totalItems() !== 1 ? 's' : '' }}</span>
                </div>
                @if (cartService.discount() > 0) {
                  <div class="confirm-row">
                    <span class="cf-label">Discount</span>
                    <span class="cf-val" style="color:#10B981;">–₹{{ cartService.discount() }}</span>
                  </div>
                }
                <div class="confirm-row total-row">
                  <span class="cf-label total-label">Grand Total</span>
                  <span class="cf-total">₹{{ cartService.grandTotal() }}</span>
                </div>
              </div>

              <div class="confirm-items-card">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="ci-row">
                    <img [src]="item.product.image" [alt]="item.product.name" class="ci-img"/>
                    <div class="ci-info">
                      <div class="ci-name">{{ item.product.name }}</div>
                      <div class="ci-qty">Qty: {{ item.quantity }} × ₹{{ item.product.price }}</div>
                    </div>
                    <span class="ci-price">₹{{ item.totalPrice }}</span>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- CTA FOOTER -->
      @if (cartService.items().length > 0) {
        <div class="cta-bar">
          @if (currentStep() < 3) {
            <button class="btn-continue" (click)="nextStep()">
              {{ currentStep() === 2 ? 'Review Order' : 'Continue' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          } @else {
            <button class="btn-place" (click)="placeOrder()" [disabled]="loading()">
              @if (loading()) { <span class="btn-spinner"></span> Placing Order... }
              @else { 🎉 Place Order · ₹{{ cartService.grandTotal() }} }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #F8FAFC;
      font-family: 'Outfit', sans-serif;
    }

    /* HEADER */
    .checkout-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      padding: 10px 14px;
      flex-shrink: 0;
      position: relative;
      min-height: 50px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      font-size: 12.5px;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      padding: 5px 11px;
      border-radius: 7px;
      font-family: inherit;
      position: relative;
      z-index: 10;
      transition: all 0.15s ease;

      svg {
        transition: transform 0.15s ease;
      }

      &:hover {
        background: #F1F5F9;
        color: #0F172A;
        border-color: #CBD5E1;

        svg {
          transform: translateX(-2px);
        }
      }

      &:active {
        transform: scale(0.96);
      }
    }

    .header-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.2px;
      pointer-events: none;
      z-index: 1;
      white-space: nowrap;
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
      position: relative;
      z-index: 10;
      transition: all 0.15s;

      &:hover {
        background: #E2E8F0;
        color: #0F172A;
      }
    }

    .header-spacer {
      width: 30px;
      position: relative;
      z-index: 10;
    }

    /* TOAST */
    .toast {
      margin: 10px 14px 0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 600;
      flex-shrink: 0;

      &.toast-warning { background: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; }
      &.toast-error   { background: #FEF2F2; border: 1px solid #FCA5A5; color: #B91C1C; }
      &.toast-success { background: #F0FDF4; border: 1px solid #86EFAC; color: #166534; }
    }

    .toast-icon { font-size: 14px; flex-shrink: 0; }
    .toast-text { flex: 1; line-height: 1.3; }
    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      font-size: 12px;
      padding: 2px 5px;
      &:hover { opacity: 1; }
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-toast { animation: toastIn 0.2s ease; }

    /* STEPPER */
    .stepper-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      border-bottom: 1px solid #F1F5F9;
      padding: 12px 20px;
      gap: 0;
      flex-shrink: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      &.clickable {
        cursor: pointer;

        &:hover .step-name {
          color: #0F172A;
          font-weight: 800;
        }

        &:hover .step-dot {
          transform: scale(1.08);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
        }
      }
    }

    .step-dot {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #E2E8F0;
      color: #94A3B8;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
    }

    .step.active .step-dot {
      background: var(--navy);
      color: #FFFFFF;
    }

    .step.done .step-dot {
      background: var(--c-ok);
      color: #FFFFFF;
    }

    .step-name {
      font-size: 9.5px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .step.active .step-name {
      color: var(--ink);
    }

    .step-line {
      height: 1.5px;
      width: 50px;
      background: #E2E8F0;
      margin: 0 4px;
      margin-bottom: 16px;
      flex-shrink: 0;
      transition: background 0.25s;
    }

    .step-line.active { background: var(--c-ok); }

    /* CONTENT */
    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .step-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .step-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #475569;
      margin-bottom: 2px;
    }

    .step-icon-box {
      width: 26px;
      height: 26px;
      background: var(--navy);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      flex-shrink: 0;
    }

    /* ADDRESS FORM */
    .address-form {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .form-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pincode-field {
      max-width: 150px;
    }

    .field-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #64748B;
    }

    .form-field input,
    .form-field select {
      width: 100%;
      padding: 9px 11px;
      border: 1.5px solid #E2E8F0;
      border-radius: 8px;
      font-size: 13px;
      font-family: 'Outfit', sans-serif;
      color: #0F172A;
      background: #F8FAFC;
      outline: none;
      transition: all 0.15s;
      box-sizing: border-box;

      &:focus {
        border-color: var(--navy);
        background: #FFFFFF;
        box-shadow: 0 0 0 2.5px rgba(2, 74, 123, 0.12);
      }

      &.error {
        border-color: #EF4444;
        background: #FFF5F5;
      }

      &::placeholder { color: #CBD5E1; }
    }

    /* SUMMARY COMPACT */
    .summary-compact {
      background: #FFFFFF;
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
    }

    .summary-compact-inner {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sc-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #F1F5F9;
    }

    .sc-img {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .sc-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .sc-name { font-size: 12.5px; font-weight: 600; color: #0F172A; }
    .sc-qty  { font-size: 11px; color: #94A3B8; }
    .sc-price { font-size: 13px; font-weight: 700; color: #0F172A; white-space: nowrap; }

    .sc-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748B;

      &.green { color: var(--c-ok); font-weight: 700; }
      &.grand { font-size: 14px; font-weight: 800; color: var(--ink); padding-top: 6px; border-top: 1.5px solid var(--line); }
    }

    /* PAYMENT LIST */
    .payment-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .payment-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1.5px solid var(--line);
      border-radius: 10px;
      padding: 12px 14px;
      cursor: pointer;
      transition: all 0.15s;
      position: relative;

      &.selected {
        border-color: var(--brass);
        background: rgba(169, 124, 67, 0.05);
      }

      &.disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      input[type="radio"] { display: none; }
    }

    .radio-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #CBD5E1;
      flex-shrink: 0;
      transition: all 0.15s;

      &.active {
        border: 6px solid var(--brass);
      }
    }

    .method-icon-wrap {
      font-size: 22px;
      flex-shrink: 0;
    }

    .method-info {
      flex: 1;
    }

    .method-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .method-sub {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 1px;
    }

    .disabled-tag {
      font-size: 9.5px;
      font-weight: 700;
      background: #FEE2E2;
      color: #B91C1C;
      padding: 2px 7px;
      border-radius: 999px;
    }

    .selected-tick {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--brass);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* CONFIRM */
    .confirm-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
    }

    .confirm-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 14px;
      border-bottom: 1px solid #F1F5F9;
      gap: 12px;

      &:last-child { border-bottom: none; }
      &.total-row { background: #F8FAFC; padding: 12px 14px; }
    }

    .cf-label {
      font-size: 11.5px;
      color: #64748B;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .cf-val {
      font-size: 12.5px;
      font-weight: 600;
      color: #0F172A;
      text-align: right;
      word-break: break-word;
    }

    .total-label {
      font-size: 13px;
      color: #0F172A;
      font-weight: 800;
    }

    .cf-total {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
    }

    .confirm-items-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
    }

    .ci-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid #F1F5F9;
      &:last-child { border-bottom: none; }
    }

    .ci-img {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      object-fit: cover;
    }

    .ci-info { flex: 1; }
    .ci-name { font-size: 12.5px; font-weight: 600; color: #0F172A; }
    .ci-qty  { font-size: 11px; color: #94A3B8; margin-top: 1px; }
    .ci-price { font-size: 13px; font-weight: 800; color: #0F172A; white-space: nowrap; }

    /* EMPTY */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      .empty-icon { font-size: 44px; margin-bottom: 10px; }
      h3 { font-size: 17px; font-weight: 800; color: #0F172A; margin: 0 0 6px; }
      p { font-size: 12.5px; color: #64748B; margin: 0 0 18px; }
    }

    .btn-browse {
      background: var(--brass);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 11px 20px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
      &:hover { background: var(--color-accent-hover); }
    }

    /* CTA FOOTER */
    .cta-bar {
      padding: 12px 14px max(14px, env(safe-area-inset-bottom));
      background: #FFFFFF;
      border-top: 1px solid var(--line);
      flex-shrink: 0;
    }

    .btn-continue, .btn-place {
      width: 100%;
      border: none;
      border-radius: 10px;
      padding: 13px;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-continue {
      background: var(--navy);
      color: #FFFFFF;
      &:hover { background: var(--navy-deep); }
    }

    .btn-place {
      background: linear-gradient(135deg, #0266A8 0%, #024A7B 50%, #0B2A44 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 16px rgba(2, 74, 123, 0.35);
      &:disabled { opacity: 0.65; cursor: not-allowed; }
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(2, 74, 123, 0.45); background: linear-gradient(135deg, #025B96 0%, #0B2A44 100%); }
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-in { animation: fadeInUp 0.28s ease both; }
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
  pulseDropError  = signal(false);
  toast           = signal<{ message: string; type: 'warning' | 'error' | 'success' } | null>(null);
  private toastTimer: any = null;

  address = {
    name: this.authService.currentUser()?.name || '',
    phone: this.authService.currentUser()?.phone || '',
    addressLine1: this.authService.activeAddress().fullAddress || '',
    addressLine2: '',
    city: this.authService.activeAddress().detail || '',
    pincode: '',
    state: ''
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
        if (active.fullAddress && !this.address.addressLine1) this.address.addressLine1 = active.fullAddress;
        if (active.detail && !this.address.city) this.address.city = active.detail;
      }
    });
  }

  steps = [
    { num: 1, label: 'Address' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirm' }
  ];

  paymentMethods = [
    { id: 'upi',  name: 'Razorpay UPI',      icon: '📱', sub: 'Google Pay, PhonePe, Paytm, etc.', disabled: false },
    { id: 'card', name: 'Card / Netbanking',  icon: '💳', sub: 'Debit / Credit Card, Netbanking',  disabled: false },
    { id: 'cod',  name: 'Cash on Delivery',   icon: '💵', sub: 'Online payment only for now',       disabled: true  }
  ];

  goBack(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    } else if (this.inlineMode) {
      this.cartService.setDrawerMode('cart');
    } else {
      this.router.navigate(['/']);
    }
  }

  goToStep(stepNum: number): void {
    if (this.currentStep() > stepNum) {
      this.currentStep.set(stepNum);
    }
  }

  closeAndNavigate(url: string): void {
    if (this.inlineMode) this.cartService.closeDrawer();
    const [path, query] = url.split('?');
    if (query) {
      this.router.navigate([path], { queryParams: Object.fromEntries(new URLSearchParams(query)) });
    } else {
      this.router.navigate([path]);
    }
  }

  showToast(message: string, type: 'warning' | 'error' | 'success' = 'warning'): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3600);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      const { name, phone, addressLine1, addressLine2, city, pincode, state } = this.address;
      if (!name || !phone || !addressLine1 || !addressLine2 || !city || !pincode || !state) {
        this.pulseDropError.set(true);
        setTimeout(() => this.pulseDropError.set(false), 1200);
        this.showToast('Please fill all required address fields', 'warning');
        return;
      }
    }
    if (this.currentStep() < 3) this.currentStep.update(v => v + 1);
  }

  async placeOrder(): Promise<void> {
    if (this.cartService.items().length === 0) { this.router.navigate(['/']); return; }
    this.loading.set(true);

    const appliedCoupon = this.cartService.appliedCoupon();
    const user = this.authService.currentUser();
    const customerPhone = this.address.phone || user?.phone || '9999999999';
    const grandTotal = this.cartService.grandTotal();

    const orderPayload: Omit<AdminOrder, 'id'> = {
      userId: user?.uid || 'guest',
      customerName: this.address.name || 'Customer',
      customerPhone,
      ...(user?.email ? { customerEmail: user.email } : {}),
      deliveryAddress: {
        name: this.address.name || 'Customer',
        phone: customerPhone,
        addressLine1: this.address.addressLine1 || '',
        addressLine2: this.address.addressLine2 || '',
        city: this.address.city || '',
        pincode: this.address.pincode || ''
      },
      items: this.cartService.items().map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image || 'assets/images/gift-box.png',
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
      grandTotal,
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
        console.error('Order failed:', err);
        this.loading.set(false);
        this.showToast('Could not place order. Check your connection.', 'error');
      }
    };

    const Razorpay = (window as any).Razorpay;
    const rzpKey = environment.razorpayKey || 'rzp_test_T0ghGBsIrMwMjX';

    if (typeof Razorpay !== 'undefined') {
      try {
        const options = {
          key: rzpKey,
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'Gift Aura',
          description: 'Gift Aura Luxury Gifts & Hampers',
          image: 'assets/images/gift-box.png',
          prefill: {
            name: orderPayload.customerName,
            contact: orderPayload.customerPhone,
            email: orderPayload.customerEmail || 'customer@giftaura.com'
          },
          theme: { color: '#024A7B' },
          handler: async (response: any) => {
            await finalizeOrder(response.razorpay_payment_id || ('RZP_' + Date.now()));
          },
          modal: { ondismiss: () => this.loading.set(false) }
        };
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', () => {
          this.loading.set(false);
          this.showToast('Payment was not completed. Please try again.', 'error');
        });
        rzp.open();
      } catch {
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
