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
      <div class="pcard-badges">
        @if (product.isBestseller) {
          <span class="pcard-badge badge-hot">HOT</span>
        }
        @if (product.originalPrice && product.originalPrice > product.price) {
          <span class="pcard-badge badge-sale">{{ getDiscount() }}% OFF</span>
        }
      </div>

      <!-- IMAGE WITH HOVER -->
      <a [routerLink]="['/product', product.id]" class="pcard-img-link">
        <div class="pcard-img-wrap">
          <img [src]="product.image" [alt]="product.name" class="pcard-img primary-img" loading="lazy">
          @if (product.secondaryImage && product.secondaryImage !== product.image) {
            <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img" loading="lazy">
          }
        </div>
      </a>

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

        <div class="pcard-action-bar">
          <button class="add-to-cart-btn" (click)="onAddToCart($event)">
            Add to Cart
          </button>
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

        .add-to-cart-btn {
          background: #000000;
          color: #ffffff;
        }
      }
    }

    .pcard-badges {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .pcard-badge {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 3px 8px;
        border-radius: 4px;
      }

      .badge-hot {
        background: #111111;
        color: #ffffff;
      }

      .badge-sale {
        background: #e84e4e;
        color: #ffffff;
      }
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
      gap: 8px;
      margin-bottom: 12px;

      .current-price {
        font-size: 15px;
        font-weight: 800;
        color: #111111;
      }

      .original-price {
        font-size: 12px;
        color: #999999;
        text-decoration: line-through;
      }
    }

    .pcard-action-bar {
      margin-top: auto;

      .add-to-cart-btn {
        width: 100%;
        background: #f4f0eb;
        color: #222222;
        border: 1px solid #dcd7cf;
        border-radius: 6px;
        padding: 9px;
        font-size: 12.5px;
        font-weight: 700;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
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
