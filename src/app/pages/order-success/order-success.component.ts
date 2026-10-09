import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';

export interface GiftParticle {
  type: 'gift' | 'ribbon' | 'sparkle' | 'star' | 'coin';
  style: string;
}

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-page">
      <!-- GIFT CELEBRATION BACKGROUND LAYER -->
      <div class="gift-confetti-layer" aria-hidden="true">
        @for (item of giftParticles; track $index) {
          <div class="gift-particle" [style]="item.style">
            @if (item.type === 'gift') {
              <span class="particle-icon gift-box">🎁</span>
            } @else if (item.type === 'ribbon') {
              <span class="particle-icon ribbon">🎀</span>
            } @else if (item.type === 'sparkle') {
              <span class="particle-icon sparkle">✨</span>
            } @else if (item.type === 'star') {
              <span class="particle-icon star">✦</span>
            } @else {
              <span class="particle-coin"></span>
            }
          </div>
        }
      </div>

      <div class="success-container animate-fade-up">

        <!-- MAIN SUCCESS CARD -->
        <div class="success-card">
          <!-- TOP-RIGHT CORNER CONTINUE SHOPPING BADGE -->
          <a routerLink="/" class="corner-shop-badge" title="Continue Shopping">
            <span>Continue Shopping</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>

          <!-- TOP STATUS SECTION -->
          <div class="card-hero">
            <div class="check-badge-wrapper">
              <div class="check-badge-glow"></div>
              <div class="check-badge">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            <h1 class="success-title">Order Placed Successfully!</h1>
            <p class="success-desc">
              Thank you for shopping with <strong>GiftAura</strong>. We've received your order and are preparing it with care.
            </p>

            <!-- ORDER ID & STATUS BADGE -->
            <div class="order-meta-pill-bar">
              <div class="order-id-chip" (click)="copyOrderId()" [title]="'Click to copy order ID'">
                <span class="chip-label">ORDER ID:</span>
                <span class="chip-id">#{{ orderId() }}</span>
                <button type="button" class="copy-btn" aria-label="Copy Order ID">
                  @if (copied()) {
                    <span class="copied-indicator">✓ Copied</span>
                  } @else {
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  }
                </button>
              </div>

              <div class="status-indicator-chip">
                <span class="status-pulse-dot"></span>
                <span>Confirmed & In Preparation</span>
              </div>
            </div>
          </div>

          <!-- KEY ORDER METRICS -->
          @if (order(); as ord) {
            <div class="metrics-grid">
              <div class="metric-card">
                <span class="metric-label">Date Placed</span>
                <span class="metric-val">{{ formatDate(ord.placedAt) }}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Payment</span>
                <span class="metric-val payment-val">
                  <span class="verified-dot">✓</span>
                  {{ ord.paymentMethod || 'Online' }} (Paid)
                </span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Total Amount</span>
                <span class="metric-val price-val">₹{{ ord.grandTotal }}</span>
              </div>
            </div>

            <!-- DELIVERY ADDRESS CARD -->
            @if (ord.deliveryAddress; as addr) {
              <div class="delivery-address-card">
                <div class="dac-header">
                  <div class="dac-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <span class="dac-title">Delivery Address</span>
                </div>
                <div class="dac-body">
                  <div class="dac-recipient">
                    <strong>{{ addr.name }}</strong>
                    <span class="dac-phone">({{ addr.phone }})</span>
                  </div>
                  <p class="dac-address">
                    {{ addr.addressLine1 }}{{ addr.addressLine2 ? ', ' + addr.addressLine2 : '' }},
                    {{ addr.city }} - {{ addr.pincode }}
                  </p>
                </div>
              </div>
            }

            <!-- ITEMS ORDERED -->
            @if (ord.items.length) {
              <div class="items-card">
                <div class="items-card-head">
                  <span class="ich-title">Items Ordered</span>
                  <span class="ich-count">{{ ord.items.length }} {{ ord.items.length === 1 ? 'item' : 'items' }}</span>
                </div>

                <div class="items-list">
                  @for (item of ord.items; track item.productId) {
                    <div class="item-row">
                      <div class="item-img-wrap">
                        <img [src]="getItemImage(item)" [alt]="item.productName" onerror="this.src='assets/images/gift-box.png'" />
                      </div>
                      <div class="item-info">
                        <h4 class="item-name" [title]="item.productName">{{ item.productName }}</h4>
                        <div class="item-meta">
                          <span class="item-qty-badge">Qty: {{ item.quantity }}</span>
                          <span class="item-unit-price">× ₹{{ item.price }}</span>
                        </div>
                      </div>
                      <div class="item-subtotal">₹{{ item.total }}</div>
                    </div>
                  }
                </div>

                <!-- BILL BREAKDOWN SUMMARY -->
                <div class="bill-summary-wrap">
                  <div class="bill-row">
                    <span>Items Subtotal</span>
                    <span>₹{{ ord.itemTotal || ord.grandTotal }}</span>
                  </div>
                  @if (ord.discount > 0) {
                    <div class="bill-row discount-row">
                      <span>Discount {{ ord.couponCode ? '(' + ord.couponCode + ')' : '' }}</span>
                      <span>− ₹{{ ord.discount }}</span>
                    </div>
                  }
                  <div class="bill-row">
                    <span>Delivery Charges</span>
                    <span class="free-text">{{ ord.deliveryCharge === 0 ? 'FREE' : '₹' + ord.deliveryCharge }}</span>
                  </div>
                  <div class="bill-divider"></div>
                  <div class="bill-row grand-total-row">
                    <span class="grand-label">Grand Total</span>
                    <span class="grand-total-val">₹{{ ord.grandTotal }}</span>
                  </div>
                </div>
              </div>
            }
          }

          <!-- ACTIONS SECTION -->
          <div class="actions-section">
            <button type="button" (click)="openProfileOrders()" class="action-btn-primary">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span>View in My Orders</span>
            </button>

            <a routerLink="/" class="action-btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Continue Shopping</span>
            </a>
          </div>

          <!-- FOOTER REASSURANCE -->
          <div class="reassurance-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            <span>Live order status & dispatch tracking are updated directly in your profile.</span>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: calc(100vh - 120px);
      background: #F8FAFC;
      background-image: 
        radial-gradient(at 15% 15%, rgba(16, 185, 129, 0.05) 0px, transparent 40%),
        radial-gradient(at 85% 15%, rgba(245, 158, 11, 0.05) 0px, transparent 40%),
        radial-gradient(at 50% 85%, rgba(15, 23, 42, 0.03) 0px, transparent 50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px 64px;
      font-family: 'Outfit', sans-serif;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }

    /* GIFT CELEBRATION BACKGROUND */
    .gift-confetti-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 1;
    }

    .gift-particle {
      position: absolute;
      top: -40px;
      will-change: transform, opacity;
      animation: giftFloatFall linear infinite;
      user-select: none;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));

      .particle-icon {
        display: inline-block;
        line-height: 1;

        &.gift-box {
          animation: giftWobble 3s ease-in-out infinite alternate;
        }

        &.ribbon {
          animation: ribbonSway 2.4s ease-in-out infinite alternate;
        }

        &.sparkle {
          animation: sparkleSpin 3.5s linear infinite;
        }

        &.star {
          color: #F59E0B;
          animation: starGlow 2s ease-in-out infinite alternate;
        }
      }

      .particle-coin {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        animation: coinTumble 2s linear infinite;
      }
    }

    @keyframes giftFloatFall {
      0% {
        transform: translateY(-40px) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.9;
      }
      50% {
        transform: translateY(50vh) translateX(28px) rotate(15deg);
      }
      75% {
        transform: translateY(75vh) translateX(-22px) rotate(-12deg);
      }
      90% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(105vh) translateX(16px) rotate(25deg);
        opacity: 0;
      }
    }

    @keyframes giftWobble {
      from { transform: rotate(-8deg) scale(0.95); }
      to { transform: rotate(10deg) scale(1.05); }
    }

    @keyframes ribbonSway {
      from { transform: rotate(-15deg); }
      to { transform: rotate(15deg); }
    }

    @keyframes sparkleSpin {
      0% { transform: scale(0.85) rotate(0deg); }
      50% { transform: scale(1.2) rotate(180deg); }
      100% { transform: scale(0.85) rotate(360deg); }
    }

    @keyframes starGlow {
      from { transform: scale(0.8); opacity: 0.5; }
      to { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6)); }
    }

    @keyframes coinTumble {
      0% { transform: scaleX(1); }
      50% { transform: scaleX(0.2); }
      100% { transform: scaleX(1); }
    }

    /* CONTAINER & MAIN CARD */
    .success-container {
      width: 100%;
      max-width: 540px;
      position: relative;
      z-index: 10;
    }

    .success-card {
      position: relative;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 32px 28px 28px;
      box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: all 0.2s ease;
    }

    /* TOP-RIGHT CORNER CONTINUE SHOPPING BADGE */
    .corner-shop-badge {
      position: absolute;
      top: 18px;
      right: 18px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #475569;
      font-size: 11.5px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 999px;
      text-decoration: none;
      transition: all 0.18s ease;
      z-index: 10;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

      svg {
        transition: transform 0.18s ease;
      }

      &:hover {
        background: var(--brass);
        border-color: var(--brass);
        color: #FFFFFF;
        box-shadow: 0 4px 12px rgba(169, 124, 67, 0.25);

        svg {
          transform: translateX(3px);
        }
      }

      &:active {
        transform: scale(0.96);
      }
    }

    @media (max-width: 520px) {
      .success-card {
        padding: 24px 18px 20px;
        border-radius: 16px;
        gap: 16px;
      }

      .corner-shop-badge {
        top: 12px;
        right: 12px;
        font-size: 10.5px;
        padding: 4px 9px;
      }
    }

    /* TOP HERO */
    .card-hero {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .check-badge-wrapper {
      position: relative;
      margin-bottom: 16px;
    }

    .check-badge-glow {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.2);
      filter: blur(8px);
      animation: pulseGlow 2.5s infinite ease-in-out;
    }

    .check-badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    @keyframes popIn {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 0.3; }
    }

    .success-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 6px;
      letter-spacing: -0.3px;
      line-height: 1.25;
    }

    .success-desc {
      font-size: 13px;
      color: #64748B;
      line-height: 1.45;
      margin: 0 0 16px;
      max-width: 440px;

      strong {
        color: #1E293B;
      }
    }

    /* ORDER META PILL BAR */
    .order-meta-pill-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .order-id-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--navy-soft, #E4EDF4);
      border: 1px solid rgba(2, 74, 123, 0.18);
      border-radius: 8px;
      padding: 5px 10px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #D5E4F0;
        border-color: rgba(2, 74, 123, 0.3);
      }

      .chip-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--navy);
        letter-spacing: 0.5px;
      }

      .chip-id {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--ink);
        font-family: monospace;
      }

      .copy-btn {
        background: none;
        border: none;
        color: #64748B;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
      }

      .copied-indicator {
        font-size: 10.5px;
        font-weight: 700;
        color: #059669;
      }
    }

    .status-indicator-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      border-radius: 8px;
      padding: 5px 11px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .status-pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
      animation: dotPulse 1.8s infinite;
    }

    @keyframes dotPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
    }

    /* KEY METRICS GRID */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;

      .metric-label {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: #64748B;
      }

      .metric-val {
        font-size: 12.5px;
        font-weight: 700;
        color: #0F172A;
      }

      .payment-val {
        color: #047857;
        display: flex;
        align-items: center;
        gap: 4px;

        .verified-dot {
          font-weight: 900;
        }
      }

      .price-val {
        font-size: 13.5px;
        font-weight: 800;
        color: #0F172A;
      }
    }

    /* DELIVERY ADDRESS CARD */
    .delivery-address-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      text-align: left;
    }

    .dac-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;

      .dac-icon {
        color: #EA580C;
        display: flex;
        align-items: center;
      }

      .dac-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748B;
      }
    }

    .dac-recipient {
      font-size: 13px;
      color: #0F172A;
      margin-bottom: 2px;

      strong {
        font-weight: 700;
      }

      .dac-phone {
        color: #64748B;
        font-weight: 500;
        margin-left: 4px;
      }
    }

    .dac-address {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
      margin: 0;
    }

    /* ITEMS ORDERED CARD */
    .items-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      text-align: left;
    }

    .items-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;

      .ich-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #475569;
      }

      .ich-count {
        background: #E2E8F0;
        color: #334155;
        font-size: 10.5px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
      }
    }

    .items-list {
      padding: 6px 14px;
      display: flex;
      flex-direction: column;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;

      &:last-child {
        border-bottom: none;
      }
    }

    .item-img-wrap {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      overflow: hidden;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748B;
    }

    .item-qty-badge {
      background: #F1F5F9;
      color: #475569;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .item-subtotal {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      flex-shrink: 0;
    }

    /* BILL BREAKDOWN */
    .bill-summary-wrap {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bill-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748B;

      &.discount-row {
        color: #059669;
        font-weight: 600;
      }

      .free-text {
        color: #059669;
        font-weight: 700;
      }
    }

    .bill-divider {
      height: 1px;
      background: #E2E8F0;
      margin: 3px 0;
    }

    .grand-total-row {
      margin-top: 2px;

      .grand-label {
        font-size: 13px;
        font-weight: 800;
        color: #0F172A;
      }

      .grand-total-val {
        font-size: 15px;
        font-weight: 900;
        color: #0F172A;
      }
    }

    /* ACTIONS SECTION */
    .actions-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-btn-primary, .action-btn-secondary {
      width: 100%;
      height: 44px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .action-btn-primary {
      background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 14px rgba(169, 124, 67, 0.28);

      &:hover {
        background: linear-gradient(135deg, #0B2A44 0%, #024A7B 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(2, 74, 123, 0.25);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .action-btn-secondary {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      color: #334155;

      &:hover {
        background: #F8FAFC;
        border-color: #94A3B8;
        color: #0F172A;
      }
    }

    /* REASSURANCE NOTE */
    .reassurance-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11px;
      color: #94A3B8;
      text-align: center;
      line-height: 1.35;
      padding: 0 8px;

      svg {
        flex-shrink: 0;
        color: #64748B;
      }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-up {
      animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  cartService = inject(CartService);
  orderId = signal('');
  copied = signal(false);

  order = computed(() => this.dataService.orders().find(o => o.id === this.orderId()));
  giftParticles: GiftParticle[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('orderId');
    if (id) {
      this.orderId.set(id);
    }

    const types: ('gift' | 'ribbon' | 'sparkle' | 'star' | 'coin')[] = [
      'gift', 'sparkle', 'gift', 'ribbon', 'sparkle', 'star', 'gift', 'coin', 'ribbon', 'sparkle'
    ];

    this.giftParticles = Array.from({ length: 28 }, (_, i) => {
      const type = types[i % types.length];
      const left = ((i * 13 + 5) % 94);
      const delay = (i * 0.28) % 4.5;
      const duration = 5.5 + ((i * 2.1) % 4);
      const size = type === 'gift' ? 22 + (i % 6) : type === 'ribbon' ? 20 + (i % 4) : 16 + (i % 6);
      const opacity = 0.7 + ((i % 4) * 0.07);

      return {
        type,
        style: `left:${left}%;font-size:${size}px;animation-delay:${delay.toFixed(2)}s;animation-duration:${duration.toFixed(2)}s;opacity:${opacity};`
      };
    });
  }

  copyOrderId(): void {
    const id = this.orderId();
    if (id) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(id);
      }
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) {
      return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getItemImage(item: any): string {
    if (item.productImage && typeof item.productImage === 'string' && item.productImage.trim()) {
      return item.productImage;
    }
    const p = this.dataService.products().find((prod: any) => prod.id === item.productId);
    if (p) {
      const match = p as any;
      if (match.image && typeof match.image === 'string') return match.image;
      if (Array.isArray(match.images) && match.images.length > 0) return match.images[0];
    }
    return 'assets/images/gift-box.png';
  }

  openProfileOrders(): void {
    this.cartService.openProfile();
  }
}
