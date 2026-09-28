import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (product()) {
      <div class="product-page">
        <!-- BREADCRUMBS -->
        <div class="product-breadcrumb-wrap">
          <div class="container">
            <div class="breadcrumbs">
              <a routerLink="/">Home</a>
              <span class="sep">/</span>
              <a routerLink="/menu">Products</a>
              <span class="sep">/</span>
              <span class="active-crumb">{{ product()!.name }}</span>
            </div>
          </div>
        </div>

        <div class="container product-container">
          <div class="product-detail-grid">
            <!-- LEFT: IMAGE GALLERY -->
            <div class="gallery-col">
              <div class="main-image-wrap">
                <img [src]="activeImage()" [alt]="product()!.name" class="main-img">
                @if (product()!.isBestseller) {
                  <span class="badge-bestseller">⭐ BESTSELLER</span>
                }
              </div>

              <!-- THUMBNAILS -->
              @if (galleryImages().length > 1) {
                <div class="thumbs-row">
                  @for (img of galleryImages(); track img) {
                    <button class="thumb-btn" 
                            [class.active]="activeImage() === img"
                            (click)="activeImage.set(img)">
                      <img [src]="img" [alt]="product()!.name">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- RIGHT: PURCHASE DETAILS -->
            <div class="info-col">
              <span class="cat-pill">{{ getCategoryName(product()!.category) }}</span>
              <h1 class="prod-title">{{ product()!.name }}</h1>

              <!-- RATING & REVIEWS -->
              <div class="prod-rating-row">
                <div class="stars-gold">★★★★★</div>
                <span class="rating-num">{{ product()!.rating }}</span>
                <span class="reviews-count">({{ product()!.ratingCount }} customer reviews)</span>
              </div>

              <!-- PRICE ROW -->
              <div class="prod-price-row">
                <span class="price-val">Rs. {{ product()!.price }}.00</span>
                @if (product()!.originalPrice && product()!.originalPrice! > product()!.price) {
                  <span class="orig-val">Rs. {{ product()!.originalPrice }}.00</span>
                  <span class="save-chip">Save {{ getDiscount() }}%</span>
                }
              </div>
              <p class="tax-note">Inclusive of all taxes. Free shipping on prepaid orders above ₹999.</p>

              <div class="divider"></div>

              <!-- SHORT DESCRIPTION -->
              <p class="prod-desc">{{ product()!.description }}</p>

              <!-- BRANDING OPTIONS -->
              <div class="branding-options">
                <h4 class="opt-title">Custom Branding Included:</h4>
                <div class="opt-pills">
                  <div class="opt-pill">✔ Laser Engraved Company Logo</div>
                  <div class="opt-pill">✔ Individual Name Personalization</div>
                  <div class="opt-pill">✔ Presentation Gift Box</div>
                </div>
              </div>

              <!-- QUANTITY & CTA -->
              <div class="purchase-action-box">
                <div class="qty-selector">
                  <span class="qty-label">Quantity:</span>
                  <div class="stepper-box">
                    <button class="step-btn" (click)="decrement()" [disabled]="qty() <= (product()!.minQty || 1)">−</button>
                    <span class="step-val">{{ qty() }}</span>
                    <button class="step-btn" (click)="increment()">+</button>
                  </div>
                </div>

                <div class="btn-group">
                  <button class="gl-btn-primary add-cart-btn" (click)="addToCart()">
                    Add to Cart • Rs. {{ computeTotal() }}.00
                  </button>
                  <a [href]="getWhatsAppInquiryUrl()" target="_blank" rel="noopener" class="gl-btn-outline bulk-quote-btn">
                    💬 Bulk WhatsApp Quote
                  </a>
                </div>
              </div>

              <!-- TRUST BADGES -->
              <div class="trust-features-list">
                <div class="tf-item">
                  <span>🏭</span>
                  <div>
                    <strong>In-House Manufacturing</strong>
                    <p>Precision CNC laser engraving & HD screen printing.</p>
                  </div>
                </div>
                <div class="tf-item">
                  <span>🚚</span>
                  <div>
                    <strong>Pan-India Express Dispatch</strong>
                    <p>Direct tracked shipping with safe protective packaging.</p>
                  </div>
                </div>
                <div class="tf-item">
                  <span>📋</span>
                  <div>
                    <strong>GST Invoicing & Digital Mockup</strong>
                    <p>Free sample design mockup before mass production.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EXTENDED SPECIFICATIONS & DESCRIPTION -->
          @if (product()!.fullDescription) {
            <div class="product-extended-section">
              <h3 class="section-title">Product Description & Branding Details</h3>
              <div class="full-desc-content">
                {{ product()!.fullDescription }}
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="container not-found-state">
        <p>Product not found.</p>
        <a routerLink="/menu" class="gl-btn-primary">Browse All Products</a>
      </div>
    }
  `,
  styles: [`
    .product-page {
      background: var(--color-bg-canvas);
      min-height: 100vh;
      padding-bottom: 80px;
    }

    .product-breadcrumb-wrap {
      background: #faf8f5;
      border-bottom: 1px solid var(--color-border);
      padding: 14px 0;

      .breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #777;

        a {
          color: #444;
          &:hover { color: #111; text-decoration: underline; }
        }

        .sep { color: #bbb; }
        .active-crumb { color: #111; font-weight: 700; }
      }
    }

    .product-container {
      margin-top: 36px;
    }

    .product-detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 36px;

      @media (min-width: 900px) {
        grid-template-columns: 1fr 1.15fr;
        gap: 48px;
      }
    }

    /* ── GALLERY ── */
    .gallery-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .main-image-wrap {
      position: relative;
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 14px;
      overflow: hidden;
      aspect-ratio: 1 / 1;

      .main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .badge-bestseller {
        position: absolute;
        top: 14px;
        left: 14px;
        background: #111111;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: 4px;
      }
    }

    .thumbs-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;

      .thumb-btn {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        background: #fff;
        flex-shrink: 0;
        transition: border-color 0.2s;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.active {
          border-color: #111111;
        }
      }
    }

    /* ── INFO ── */
    .info-col {
      display: flex;
      flex-direction: column;
    }

    .cat-pill {
      display: inline-block;
      align-self: flex-start;
      background: rgba(166, 137, 59, 0.12);
      color: var(--color-accent);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }

    .prod-title {
      font-size: clamp(22px, 3vw, 32px);
      font-weight: 900;
      color: #111111;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    .prod-rating-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      margin-bottom: 16px;

      .stars-gold {
        color: #f59e0b;
        letter-spacing: 1px;
      }

      .rating-num {
        font-weight: 800;
        color: #111;
      }

      .reviews-count {
        color: #777;
      }
    }

    .prod-price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 4px;

      .price-val {
        font-size: 28px;
        font-weight: 900;
        color: #111111;
      }

      .orig-val {
        font-size: 16px;
        color: #999999;
        text-decoration: line-through;
      }

      .save-chip {
        background: #e84e4e;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 4px;
      }
    }

    .tax-note {
      font-size: 12.5px;
      color: #777;
      margin-bottom: 20px;
    }

    .divider {
      height: 1px;
      background: var(--color-border);
      margin: 16px 0 20px;
    }

    .prod-desc {
      font-size: 14.5px;
      color: #555555;
      line-height: 1.65;
      margin-bottom: 24px;
    }

    .branding-options {
      background: #faf8f5;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;

      .opt-title {
        font-size: 13px;
        font-weight: 700;
        color: #111;
        margin-bottom: 10px;
      }

      .opt-pills {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .opt-pill {
          font-size: 13px;
          color: #27ae60;
          font-weight: 600;
        }
      }
    }

    .purchase-action-box {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 28px;

      .qty-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        .qty-label {
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }

        .stepper-box {
          display: flex;
          align-items: center;
          border: 1px solid #dcd7cf;
          border-radius: 6px;
          overflow: hidden;

          .step-btn {
            width: 36px;
            height: 36px;
            background: #faf8f5;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover { background: #eeebe6; }
          }

          .step-val {
            min-width: 44px;
            text-align: center;
            font-size: 14px;
            font-weight: 800;
          }
        }
      }

      .btn-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .add-cart-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
        }

        .bulk-quote-btn {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          text-align: center;
        }
      }
    }

    .trust-features-list {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .tf-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        span {
          font-size: 20px;
        }

        strong {
          display: block;
          font-size: 13.5px;
          color: #111;
        }

        p {
          font-size: 12px;
          color: #777;
          margin: 0;
        }
      }
    }

    .product-extended-section {
      margin-top: 60px;
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 36px;

      .section-title {
        font-size: 20px;
        font-weight: 800;
        color: #111;
        margin-bottom: 16px;
        position: relative;
        padding-bottom: 8px;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: #111;
        }
      }

      .full-desc-content {
        font-size: 14.5px;
        color: #555555;
        line-height: 1.8;
      }
    }

    .not-found-state {
      padding: 100px 20px;
      text-align: center;
      p { font-size: 18px; margin-bottom: 20px; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  readonly product = signal<Product | null>(null);
  readonly activeImage = signal<string>('');
  readonly galleryImages = signal<string[]>([]);
  readonly qty = signal<number>(1);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.productService.getById(id);
        if (found) {
          this.product.set(found);
          this.activeImage.set(found.image);
          const imgs = found.images && found.images.length > 0 ? found.images : [found.image];
          this.galleryImages.set(imgs);
          this.qty.set(found.minQty || 1);
        } else {
          this.product.set(null);
        }
      }
    });
  }

  increment() {
    this.qty.update(q => q + 1);
  }

  decrement() {
    const min = this.product()?.minQty || 1;
    if (this.qty() > min) {
      this.qty.update(q => q - 1);
    }
  }

  getDiscount(): number {
    const p = this.product();
    if (!p || !p.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  computeTotal(): number {
    const p = this.product();
    return p ? p.price * this.qty() : 0;
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p, this.qty());
    this.cartService.openDrawer();
  }

  getCategoryName(catKey: string): string {
    const map: any = {
      't-shirts': 'Customized T-Shirts',
      'welcome-kits': 'Welcome Kits & Combo',
      'corporate-gifts': 'Pens & Corporate Gifts',
      'keychains-badges': 'Keychains & Badges',
      'office-essentials': 'Office Essentials',
      'drinkware': 'Drinkware & Flasks'
    };
    return map[catKey] || 'Corporate Product';
  }

  getWhatsAppInquiryUrl(): string {
    const p = this.product();
    if (!p) return 'https://wa.me/917877605311';
    const text = `Hi Graphic Line, I want to inquire about bulk ordering ${p.name} (Quantity: ${this.qty()} units).`;
    return `https://wa.me/917877605311?text=${encodeURIComponent(text)}`;
  }
}
