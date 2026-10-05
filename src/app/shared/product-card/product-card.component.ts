import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pcard">

      <!-- ── IMAGE SECTION ── -->
      <a [routerLink]="['/product', product.id]" class="pcard-img-link">
        <div class="pcard-img-wrap">
          <img [src]="product.image" [alt]="product.name" class="pcard-img primary-img" loading="lazy">
          @if (product.secondaryImage && product.secondaryImage !== product.image) {
            <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img" loading="lazy">
          }
          <div class="img-hover-tint"></div>
        </div>

        <!-- Badges absolute on image -->
        <div class="pcard-badge-group">
          @if (product.isBestseller) {
            <span class="badge-best">★ BESTSELLER</span>
          }
          @if (getDiscount() > 0) {
            <span class="badge-off">{{ getDiscount() }}% OFF</span>
          }
        </div>
      </a>

      <!-- ── INFO SECTION ── -->
      <div class="pcard-info">

        <div class="pcard-rating">
          <span class="stars">★</span>
          <span class="rnum">{{ product.rating }}</span>
          <span class="rcount">({{ product.ratingCount }})</span>
        </div>

        <a [routerLink]="['/product', product.id]" class="pcard-name-link">
          <h3 class="pcard-name">{{ product.name }}</h3>
        </a>

        <!-- Price + Cart Button Row -->
        <div class="pcard-bottom-row">
          <div class="pcard-price-col">
            <span class="price-now">₹{{ product.price }}</span>
            @if (product.originalPrice && product.originalPrice > product.price) {
              <span class="price-was">₹{{ product.originalPrice }}</span>
            }
          </div>
          <button class="pcard-add-btn" (click)="onAddToCart($event)" aria-label="Add to Cart">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="btn-label">Add</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Card Shell ── */
    .pcard {
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow:
        0 2px 12px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transition: all 0.38s cubic-bezier(0.16, 1, 0.3, 1);
      height: 100%;

      &:hover {
        transform: translateY(-7px) scale(1.012);
        border-color: rgba(212, 175, 55, 0.5);
        box-shadow:
          0 20px 48px rgba(212, 175, 55, 0.13),
          0 8px 20px rgba(0, 0, 0, 0.07),
          inset 0 1px 0 #fff;
        background: rgba(255, 255, 255, 0.96);

        .primary-img { transform: scale(1.07); }
        .hover-img   { opacity: 1; }
        .img-hover-tint { opacity: 1; }
      }
    }

    /* ── Image ── */
    .pcard-img-link {
      display: block;
      position: relative;
      text-decoration: none;
    }

    .pcard-img-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: linear-gradient(145deg, #fdfcf9 0%, #f5f0e8 100%);
      overflow: hidden;

      .pcard-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

        &.hover-img { opacity: 0; }
      }
    }

    .img-hover-tint {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.07) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    /* ── Badges ── */
    .pcard-badge-group {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
      z-index: 5;

      @media (max-width: 480px) {
        top: 7px;
        left: 7px;
        right: 7px;
      }
    }

    .badge-best {
      display: inline-flex;
      align-items: center;
      background: rgba(17, 20, 28, 0.88);
      backdrop-filter: blur(8px);
      color: #fbbf24;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.4px;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid rgba(251, 191, 36, 0.3);

      @media (max-width: 480px) {
        font-size: 8px;
        padding: 3px 6px;
      }
    }

    .badge-off {
      display: inline-flex;
      align-items: center;
      background: rgba(220, 38, 38, 0.88);
      backdrop-filter: blur(6px);
      color: #fff;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
      padding: 4px 8px;
      border-radius: 6px;
      margin-left: auto;

      @media (max-width: 480px) {
        font-size: 8px;
        padding: 3px 6px;
      }
    }

    /* ── Info Section ── */
    .pcard-info {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(235, 229, 216, 0.55);

      @media (max-width: 480px) {
        padding: 10px 11px 12px;
        gap: 4px;
      }
    }

    /* Rating */
    .pcard-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;

      .stars  { color: #f59e0b; font-size: 13px; }
      .rnum   { font-weight: 700; color: #111; }
      .rcount { color: #9ca3af; font-size: 10.5px; }
    }

    /* Name */
    .pcard-name-link { text-decoration: none; }

    .pcard-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
      margin: 0;
      transition: color 0.2s;

      @media (max-width: 480px) {
        font-size: 12.5px;
        min-height: 33px;
      }

      &:hover { color: #d4af37; }
    }

    /* Price + Cart */
    .pcard-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 3px;
    }

    .pcard-price-col {
      display: flex;
      flex-direction: column;
      gap: 1px;

      .price-now {
        font-size: 16px;
        font-weight: 900;
        color: #11141c;
        letter-spacing: -0.02em;
        line-height: 1;

        @media (max-width: 480px) { font-size: 14px; }
      }

      .price-was {
        font-size: 11px;
        color: #a1a1aa;
        text-decoration: line-through;
        line-height: 1;
      }
    }

    /* Add Button — always visible */
    .pcard-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
      color: #111111;
      border: none;
      border-radius: 100px;
      padding: 8px 13px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.32);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;

      @media (max-width: 480px) {
        padding: 7px 10px;
        font-size: 11px;
        gap: 4px;
      }

      &:hover {
        background: linear-gradient(135deg, #b8922d 0%, #e08e00 100%);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
        transform: translateY(-1px);
      }

      &:active { transform: scale(0.92); }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() mode: 'grid' | 'list' | 'popular' = 'grid';

  private cartService = inject(CartService);

  get cartQty(): number {
    return this.cartService.getQty(this.product?.id ?? '');
  }

  getDiscount(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.price) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product, 1);
    this.cartService.openDrawer();
  }
}
