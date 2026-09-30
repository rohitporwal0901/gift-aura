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
    <div class="gl-pcard">
      <!-- BADGES -->
      @if (product.isBestseller) {
        <span class="badge-bestseller">BESTSELLER</span>
      }
      @if (product.originalPrice && product.originalPrice > product.price) {
        <span class="badge-discount">{{ getDiscount() }}% OFF</span>
      }

      <!-- MEDIA BOX (Image + Overlay Actions) -->
      <div class="pcard-media-box">
        <a [routerLink]="['/product', product.id]" class="pcard-img-link">
          <div class="pcard-img-wrap">
            <img [src]="product.image" [alt]="product.name" class="pcard-img primary-img" loading="lazy">
            @if (product.secondaryImage && product.secondaryImage !== product.image) {
              <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img" loading="lazy">
            }
          </div>
        </a>

        <!-- QUICK ACTIONS -->
        <div class="pcard-quick-actions">
          <button class="quick-add-btn" (click)="onAddToCart($event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>

      <!-- BODY -->
      <div class="pcard-body">
        <div class="pcard-meta">
          <div class="pcard-stars">
            <span class="star-icon">★</span>
            <span class="rating-num">{{ product.rating }}</span>
            <span class="reviews-count">({{ product.ratingCount }})</span>
          </div>
        </div>

        <a [routerLink]="['/product', product.id]" class="pcard-title-link">
          <h3 class="pcard-title">{{ product.name }}</h3>
        </a>

        <div class="pcard-pricing">
          <span class="current-price">Rs. {{ product.price }}.00</span>
          @if (product.originalPrice && product.originalPrice > product.price) {
            <span class="original-price">Rs. {{ product.originalPrice }}.00</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gl-pcard {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: #d8d1c7;

        .hover-img {
          opacity: 1;
        }

        .pcard-quick-actions {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }

    .badge-bestseller {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 5;
      background: #111111;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .badge-discount {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 5;
      background: #2563eb;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .pcard-media-box {
      position: relative;
    }

    .pcard-img-link {
      display: block;
      width: 100%;
    }

    .pcard-img-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f7f5f2;
      overflow: hidden;

      .pcard-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        inset: 0;
        transition: opacity 0.35s ease, transform 0.4s ease;

        &.hover-img {
          opacity: 0;
        }
      }
    }

    .pcard-body {
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .pcard-meta {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      .pcard-stars {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        color: #666;

        .star-icon {
          color: #f59e0b;
        }
        .rating-num {
          font-weight: 700;
          color: #111;
        }
        .reviews-count {
          color: #999;
          font-size: 11px;
        }
      }
    }

    .pcard-title-link {
      display: block;
      margin-bottom: 10px;
    }

    .pcard-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #111111;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
      transition: color 0.2s;

      &:hover {
        color: var(--color-accent);
      }
    }

    .pcard-pricing {
      display: flex;
      align-items: baseline;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;

      .current-price {
        font-size: 14px;
        font-weight: 800;
        color: #111111;
        white-space: nowrap;
      }

      .original-price {
        font-size: 11.5px;
        color: #999999;
        text-decoration: line-through;
        white-space: nowrap;
      }
    }
    .pcard-quick-actions {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.3s ease;
      z-index: 6;

      @media (max-width: 768px) {
        opacity: 1;
        transform: translateY(0);
      }

      .quick-add-btn {
        width: 100%;
        background: var(--color-accent);
        color: #111111;
        border: none;
        border-radius: var(--radius-full);
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 6px 16px rgba(0,0,0,0.15);

        &:hover {
          background: #111111;
          color: #ffffff;
          transform: translateY(-2px);
        }
      }
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
