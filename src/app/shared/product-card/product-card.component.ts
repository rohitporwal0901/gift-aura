import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

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
          @if (hoverImage) {
            <img [src]="hoverImage" [alt]="product.name" class="pcard-img hover-img">
          }

          <!-- Badges on image (Only bestseller and discount, no wishlist) -->
          <div class="pcard-badge-group">
            @if (product.isBestseller) {
              <span class="badge-best">★ BESTSELLER</span>
            }
            @if (getDiscount() > 0) {
              <span class="badge-off">{{ getDiscount() }}% OFF</span>
            }
          </div>
        </div>
      </a>

      <!-- ── INFO SECTION ── -->
      <div class="pcard-info">

        <!-- Rating -->
        <div class="pcard-rating">
          <div class="rating-stars">
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
          </div>
          <span class="rnum">{{ product.rating }}</span>
          <span class="rcount">({{ product.ratingCount }})</span>
        </div>

        <!-- Name -->
        <a [routerLink]="['/product', product.id]" class="pcard-name-link">
          <h3 class="pcard-name">{{ product.name }}</h3>
        </a>

        <!-- Subtitle / Short Description -->
        @if (product.description) {
          <p class="pcard-desc">{{ product.description }}</p>
        }

        <!-- Price Row -->
        <div class="pcard-price-row">
          <span class="price-now">₹{{ product.price.toLocaleString('en-IN') }}</span>
          @if (product.originalPrice && product.originalPrice > product.price) {
            <span class="price-was">₹{{ product.originalPrice.toLocaleString('en-IN') }}</span>
          }
        </div>

        <!-- Full-width Add to Cart Button -->
        <button class="pcard-add-btn" (click)="onAddToCart($event)" aria-label="Add to Cart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Add to Cart</span>
        </button>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    /* ── Card Shell ── */
    .pcard {
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      background: #ffffff;
      border: 1px solid var(--line);
      box-shadow: 0 2px 8px rgba(15, 30, 44, 0.04);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      height: 100%;
      padding: 8px;

      @media (max-width: 480px) {
        padding: 6px;
        border-radius: 14px;
      }

      &:hover,
      .pcard-img-wrap:hover {
        transform: translateY(-4px);
        border-color: var(--brass);
        box-shadow: 0 12px 28px rgba(15, 30, 44, 0.1);

        .primary-img { transform: scale(1.05); }
        .hover-img   { opacity: 1 !important; transform: scale(1.05); }
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
      border-radius: 12px;
      background: var(--paper-2);
      overflow: hidden;

      .pcard-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);

        &.primary-img {
          z-index: 1;
        }

        &.hover-img {
          z-index: 2;
          opacity: 0;
          pointer-events: none;
        }
      }
    }

    /* ── Badges ── */
    .pcard-badge-group {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      pointer-events: none;
      z-index: 5;
    }

    .badge-best {
      display: inline-flex;
      align-items: center;
      background: var(--navy-deep);
      color: var(--brass-soft);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.3px;
      padding: 3.5px 7px;
      border-radius: 4px;

      @media (max-width: 480px) {
        font-size: 8.5px;
        padding: 2.5px 5px;
      }
    }

    .badge-off {
      display: inline-flex;
      align-items: center;
      background: var(--c-bad);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2px;
      padding: 3.5px 7px;
      border-radius: 4px;
      margin-left: auto;

      @media (max-width: 480px) {
        font-size: 8.5px;
        padding: 2.5px 5px;
      }
    }

    /* ── Info Section ── */
    .pcard-info {
      padding: 10px 4px 2px;
      display: flex;
      flex-direction: column;
      flex: 1;

      @media (max-width: 480px) {
        padding: 8px 2px 2px;
      }
    }

    /* Rating */
    .pcard-rating {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      margin-bottom: 4px;

      .rating-stars {
        display: inline-flex;
        gap: 1px;
        color: var(--c-warn);
        font-size: 11px;
      }

      .rnum {
        font-weight: 700;
        color: var(--ink);
        font-size: 12px;
      }

      .rcount {
        color: var(--muted);
        font-size: 11.5px;
      }
    }

    /* Name */
    .pcard-name-link {
      text-decoration: none;
    }

    .pcard-name {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.3;
      margin: 0 0 3px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;

      @media (max-width: 480px) {
        font-size: 13px;
      }

      &:hover {
        color: var(--navy);
      }
    }

    /* Subtitle / Description */
    .pcard-desc {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.35;
      margin: 0 0 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 480px) {
        font-size: 11px;
        margin-bottom: 6px;
      }
    }

    /* Price Row */
    .pcard-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-top: auto;
      margin-bottom: 12px;

      @media (max-width: 480px) {
        margin-bottom: 10px;
      }

      .price-now {
        font-size: 16.5px;
        font-weight: 700;
        color: var(--navy);
        letter-spacing: -0.01em;

        @media (max-width: 480px) {
          font-size: 14.5px;
        }
      }

      .price-was {
        font-size: 12px;
        color: #9ca3af;
        text-decoration: line-through;

        @media (max-width: 480px) {
          font-size: 11px;
        }
      }
    }

    /* Add to Cart Button — Luxury Warm Brass */
    .pcard-add-btn {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.22s ease;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: skewX(-20deg);
        animation: gl-shimmer 2.5s infinite;
      }

      @media (max-width: 480px) {
        height: 30px;
        font-size: 11.5px;
        gap: 5px;
      }

      &:hover {
        background: linear-gradient(135deg, #B58A50 0%, #8E6633 50%, #724E20 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(169, 124, 67, 0.35);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() mode: 'grid' | 'list' | 'popular' = 'grid';

  private cartService = inject(CartService);
  private authService = inject(AuthService);

  get hoverImage(): string | null {
    if (this.product?.secondaryImage && this.product.secondaryImage !== this.product.image) {
      return this.product.secondaryImage;
    }
    if (this.product?.images && this.product.images.length > 1) {
      const second = this.product.images.find(img => img && img !== this.product.image);
      if (second) return second;
    }
    return null;
  }

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
    if (!this.authService.isLoggedIn()) {
      this.cartService.openDrawer();
      return;
    }
    this.cartService.addToCart(this.product, 1);
    this.cartService.openDrawer();
  }
}
