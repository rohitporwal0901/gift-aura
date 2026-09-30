import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-page">
      <!-- CELEBRATION PARTICLES -->
      <div class="confetti" aria-hidden="true">
        @for (style of confettiStyles; track $index) {
          <div class="confetti-piece" [style]="style"></div>
        }
      </div>

      <!-- SUCCESS CARD -->
      <div class="success-card animate-scaleIn">
        <!-- CHECK ICON -->
        <div class="check-circle">
          <div class="check-ring"></div>
          <div class="check-mark">✓</div>
        </div>

        <h1 class="success-title">Order Placed<br>Successfully!</h1>
        <p class="success-sub">Thank you for choosing <strong>Gift Aura</strong>!<br>Your order <strong>#{{ orderId() }}</strong> has been confirmed.</p>

        <!-- STATUS BADGE -->
        <div class="status-pill">
          <span class="pulse-dot"></span>
          <span>Order Confirmed & Being Prepared</span>
        </div>

        <!-- DETAILS CARD -->
        @if (order()) {
          <div class="order-summary-box">
            <div class="summary-row">
              <span class="s-label">Payment</span>
              <span class="s-val highlight">{{ order()?.paymentMethod || 'Online' }} (Paid)</span>
            </div>
            <div class="summary-row">
              <span class="s-label">Total Amount</span>
              <span class="s-val bold">₹{{ order()?.grandTotal }}</span>
            </div>
            @if (order()?.deliveryAddress; as addr) {
              <div class="summary-divider"></div>
              <div class="address-preview">
                <div class="addr-title">📍 Delivery To</div>
                <div class="addr-name">{{ addr.name }} ({{ addr.phone }})</div>
                <div class="addr-text">
                  {{ addr.addressLine1 }}{{ addr.addressLine2 ? ', ' + addr.addressLine2 : '' }},
                  {{ addr.city }} - {{ addr.pincode }}
                </div>
              </div>
            }
          </div>
        }

        <!-- ITEMS PREVIEW -->
        @if (order()?.items?.length) {
          <div class="items-list">
            <div class="items-heading">Items Ordered ({{ order()!.items.length }})</div>
            @for (item of order()!.items; track item.productId) {
              <div class="item-row">
                <img [src]="item.productImage || 'assets/images/gift-box.png'" [alt]="item.productName" class="item-img" />
                <div class="item-details">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-qty">Qty: {{ item.quantity }} × ₹{{ item.price }}</div>
                </div>
                <div class="item-total">₹{{ item.total }}</div>
              </div>
            }
          </div>
        }

        <!-- ACTIONS -->
        <div class="success-actions">
          <button (click)="openProfileOrders()" class="btn-profile">
            📦 View in My Orders
          </button>
          <a routerLink="/" class="btn-home">
            🛍️ Continue Shopping
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px 60px;
      position: relative;
      overflow: hidden;
      font-family: 'Outfit', sans-serif;
    }

    /* CONFETTI */
    .confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
    .confetti-piece {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      animation: confettiFall linear infinite;
    }
    @keyframes confettiFall {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* SUCCESS CARD */
    .success-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 24px 20px 22px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      max-width: 420px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    /* CHECK CIRCLE */
    .check-circle {
      width: 76px;
      height: 76px;
      margin: 0 auto 16px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .check-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid #10B981;
      animation: ringPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    .check-mark {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10B981, #059669);
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounceIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
    }

    @keyframes ringPop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes bounceIn {
      from { transform: scale(0); }
      60% { transform: scale(1.15); }
      to { transform: scale(1); }
    }

    .success-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .success-sub {
      font-size: 12.5px;
      color: #64748B;
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      animation: dotPulse 1.5s infinite;
    }
    @keyframes dotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* SUMMARY BOX */
    .order-summary-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 14px 16px;
      text-align: left;
      margin-bottom: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .s-label { color: #64748B; }
    .s-val { color: #1E293B; font-weight: 600; }
    .s-val.highlight { color: #059669; }
    .s-val.bold { font-size: 15px; font-weight: 800; color: #0F172A; }

    .summary-divider {
      height: 1px;
      background: #E2E8F0;
      margin: 10px 0;
    }

    .address-preview {
      font-size: 12.5px;
    }
    .addr-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 2px;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .addr-name {
      font-weight: 600;
      color: #0F172A;
    }
    .addr-text {
      color: #64748B;
      line-height: 1.4;
      margin-top: 2px;
    }

    /* ITEMS LIST */
    .items-list {
      background: #FFFFFF;
      border: 1px solid #F1F5F9;
      border-radius: 14px;
      padding: 12px;
      margin-bottom: 20px;
      text-align: left;
      max-height: 180px;
      overflow-y: auto;
    }
    .items-heading {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
      margin-bottom: 8px;
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      border-bottom: 1px solid #F8FAFC;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .item-img {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
      background: #F1F5F9;
    }
    .item-details {
      flex: 1;
      min-width: 0;
    }
    .item-name {
      font-size: 12.5px;
      font-weight: 600;
      color: #1E293B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-qty {
      font-size: 11px;
      color: #64748B;
    }
    .item-total {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
    }

    /* ACTIONS */
    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-profile, .btn-home {
      display: block;
      width: 100%;
      border-radius: 10px;
      padding: 12px;
      font-size: 13.5px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      transition: all 0.18s;
      cursor: pointer;
      border: none;
      box-sizing: border-box;
      font-family: 'Outfit', sans-serif;
    }
    .btn-profile {
      background: #0F172A;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.22);
    }
    .btn-profile:hover {
      background: #1E293B;
      transform: translateY(-1px);
    }
    .btn-home {
      background: transparent;
      color: #64748B;
      border: 1.5px solid #E2E8F0;
    }
    .btn-home:hover {
      background: #F1F5F9;
      color: #0F172A;
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scaleIn {
      animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  cartService = inject(CartService);
  orderId = signal('');

  order = computed(() => this.dataService.orders().find(o => o.id === this.orderId()));
  confettiStyles: string[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('orderId');
    if (id) {
      this.orderId.set(id);
    }

    const colors = ['#E11D48', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    this.confettiStyles = Array.from({ length: 24 }, (_, i) => {
      const color = colors[i % colors.length];
      const left = ((i * 17 + 7) % 96);
      const delay = (i * 0.2) % 3;
      const duration = 2.2 + ((i * 3) % 3);
      return `left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${duration}s;top:-20px;`;
    });
  }

  openProfileOrders(): void {
    this.cartService.setDrawerMode('profile');
    this.cartService.openDrawer();
    this.router.navigate(['/']);
  }
}
