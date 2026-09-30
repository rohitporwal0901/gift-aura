import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, DOCUMENT, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  btnText: string;
  btnLink: string;
  queryParams?: any;
  image: string;
}

interface ReelItem {
  id: string;
  title: string;
  name: string;
  videoUrl: string;
  thumbnail: string;
  productId?: string;
  productName?: string;
  price?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="gl-home-page">
      <!-- 1. HERO SLIDESHOW -->
      <section class="gl-hero-section">
        <div class="hero-slider-track" [style.transform]="'translateX(-' + currentHeroIndex() * 100 + '%)'">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <div class="hero-slide">
              <img [src]="slide.image" [alt]="slide.title" class="hero-bg-img">
              <div class="hero-overlay"></div>
              <div class="container hero-content-container">
                <div class="hero-text-block animate-fade-in-up">
                  <div class="hero-badge-pill">
                    <span class="badge-sparkle">✦</span> {{ slide.badge }}
                  </div>
                  <h1 class="hero-main-title">{{ slide.title }}</h1>
                  <p class="hero-subtext">{{ slide.subtitle }}</p>
                  <div class="hero-btn-row">
                    <a [routerLink]="slide.btnLink" [queryParams]="slide.queryParams" class="gl-btn-primary hero-btn-main">
                      <span>{{ slide.btnText }}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                    <a href="#inquiry" class="gl-btn-outline hero-btn-sub">
                      Bulk Order Inquiry
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- HERO NAVIGATION ARROWS -->
        <button class="hero-nav-btn prev" (click)="prevHeroSlide()" aria-label="Previous Slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="hero-nav-btn next" (click)="nextHeroSlide()" aria-label="Next Slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- HERO CONTROLS -->
        <div class="hero-indicators">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <button class="indicator-dot" [class.active]="currentHeroIndex() === i" (click)="setHeroIndex(i)" [attr.aria-label]="'Go to slide ' + (i + 1)"></button>
          }
        </div>
      </section>

     

      <!-- 2. INSIDE GIFTAURA (Behind-the-scenes Reels & Factory) -->
      <!-- 2. INSIDE GIFTAURA (Behind-the-scenes Reels & Factory) -->
      <section class="gl-section inside-gl-section">
        <div class="container">
          <div class="gl-section-header">
            <span class="gl-section-pill gl-badge-pill">✦ IN-HOUSE PRODUCTION</span>
            <h2 class="gl-section-title">Inside the GiftAura Workshop</h2>
            <p class="gl-section-subtitle">Real look into our German fiber laser engraving, HD apparel embroidery &amp; daily corporate order dispatches.</p>
          </div>

          <div class="reels-slider-wrap">
            <div class="reels-grid">
              @for (reel of reelsList; track reel.id) {
                <div class="reel-card" (click)="openVideoModal(reel)">
                  <div class="reel-thumb-frame">
                    <video [src]="reel.videoUrl" class="reel-img" autoplay muted loop playsinline></video>
                    
                    <div class="reel-top-bar">
                      <span class="reel-live-tag">
                        <span class="live-dot"></span> LIVE FACTORY
                      </span>
                    </div>

                    <div class="reel-play-overlay">
                      <div class="play-circle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#111111">
                          <polygon points="6 4 20 12 6 20 6 4"></polygon>
                        </svg>
                      </div>
                    </div>

                    <div class="reel-bottom-overlay">
                      <div class="reel-tag-badge">{{ reel.name }}</div>
                      <h4 class="reel-title">{{ reel.title }}</h4>
                      <span class="reel-action-btn">
                        Watch Reel
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- 3. TRENDING CORPORATE GIFTS (Product Grid with Filters) -->
      <section class="gl-section trending-section" id="products">
        <div class="container">
          <div class="gl-section-header">
            <span class="gl-section-pill gl-badge-pill">✦ BESTSELLERS CATALOG</span>
            <h2 class="gl-section-title">Trending Corporate Gifts</h2>
            <p class="gl-section-subtitle">Laser engraved executive pens, customized keychains, mobile stands &amp; premium welcome gift sets.</p>
          </div>

          <!-- CATEGORY PILL FILTER -->
          <div class="gl-filter-tabs">
            <button class="filter-tab" [class.active]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">
              <span>All Products</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'corporate-gifts'" (click)="selectedCategory.set('corporate-gifts')">
              <span>Pens & Diaries</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'welcome-kits'" (click)="selectedCategory.set('welcome-kits')">
              <span>Welcome Kits</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 't-shirts'" (click)="selectedCategory.set('t-shirts')">
              <span>Customized T-Shirts</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'keychains-badges'" (click)="selectedCategory.set('keychains-badges')">
              <span>Keychains & Badges</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'office-essentials'" (click)="selectedCategory.set('office-essentials')">
              <span>Office Essentials</span>
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'drinkware'" (click)="selectedCategory.set('drinkware')">
              <span>Vacuum Flasks</span>
            </button>
          </div>

          <!-- PRODUCTS GRID -->
          <div class="gl-products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="gl-product-card">
                <!-- BADGES -->
                <div class="pcard-badge-row">
                  @if (product.isBestseller) {
                    <span class="badge-bestseller">
                      <span class="badge-icon">★</span> BESTSELLER
                    </span>
                  }
                  @if (product.originalPrice && product.originalPrice > product.price) {
                    <span class="badge-discount">
                      {{ getDiscountPercent(product.price, product.originalPrice) }}% OFF
                    </span>
                  }
                </div>

                <!-- MEDIA BOX (Image + Overlay Actions) -->
                <div class="pcard-media-box">
                  <!-- IMAGE CONTAINER WITH DUAL-IMAGE HOVER -->
                  <a [routerLink]="['/product', product.id]" class="pcard-img-link">
                    <div class="pcard-img-wrap">
                      <img [src]="product.image" [alt]="product.name" class="pcard-img main-img" loading="lazy">
                      @if (product.secondaryImage && product.secondaryImage !== product.image) {
                        <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img" loading="lazy">
                      }
                    </div>
                  </a>

                  <!-- QUICK ACTIONS -->
                  <div class="pcard-quick-actions">
                    <button class="quick-view-action-btn" (click)="openQuickView(product)" title="Quick View">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Quick View
                    </button>
                    <button class="quick-add-btn" (click)="addToCart(product)" title="Add to Cart">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>

                <!-- CARD BODY -->
                <div class="pcard-body">
                  <div class="pcard-rating">
                    <span class="star">★</span>
                    <span class="rating-val">{{ product.rating }}</span>
                    <span class="rating-count">({{ product.ratingCount }})</span>
                  </div>
                  <a [routerLink]="['/product', product.id]" class="pcard-title-link">
                    <h3 class="pcard-title">{{ product.name }}</h3>
                  </a>
                  <div class="pcard-price-row">
                    <span class="price-current">₹{{ product.price }}</span>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="price-original">₹{{ product.originalPrice }}</span>
                      <span class="price-save">Save ₹{{ product.originalPrice - product.price }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="view-all-row">
            <a routerLink="/menu" class="gl-btn-primary view-all-btn">
              <span>View All {{ allProducts().length }} Products</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
            <!-- 7. WHY CHOOSE GIFTAURA -->
      <section class="gl-section why-choose-section" id="why-choose">
        <div class="container">
          <div class="gl-section-header">
            <span class="gl-section-pill gl-badge-pill">✦ THE GIFTAURA ADVANTAGE</span>
            <h2 class="gl-section-title">Why Leading Brands Choose GiftAura</h2>
            <p class="gl-section-subtitle">From startup welcome kits to 5,000+ corporate uniform orders, we deliver uncompromised quality.</p>
          </div>

          <div class="why-grid">
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 class="why-card-title">Executive Grade Quality</h3>
              <p class="why-card-desc">High-density 240+ GSM cotton fabrics, stainless steel flasks &amp; precision German laser branding.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
              </div>
              <h3 class="why-card-title">In-House Customization</h3>
              <p class="why-card-desc">Laser engraving, multi-color UV printing, digital embroidery &amp; custom debossing directly at our facility.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <h3 class="why-card-title">Direct Factory Pricing</h3>
              <p class="why-card-desc">No middle-men markup. Get tiered corporate discounts, GST tax invoicing &amp; flexible payment terms.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h3 class="why-card-title">Pan-India Express Dispatch</h3>
              <p class="why-card-desc">Reliable courier network delivering to 19,000+ pin codes with live consignment tracking.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. REVIEWS & TESTIMONIALS -->
      <section class="gl-section reviews-section">
        <div class="container">
          <div class="gl-section-header">
            <span class="gl-section-pill gl-badge-pill">✦ CORPORATE CLIENT REVIEWS</span>
            <h2 class="gl-section-title">What Our Clients Say</h2>
            <p class="gl-section-subtitle">Trusted by 500+ Indian enterprises, coaching hubs &amp; high-growth startups</p>
          </div>

          <div class="reviews-wrapper">
            <div class="reviews-grid">
              @for (rev of customerReviews; track rev.name) {
                <div class="review-card">
                  <div class="rev-card-header">
                    <div class="rev-stars">★★★★★</div>
                    <span class="rev-verified-pill">✔ Verified Order</span>
                  </div>
                  <h4 class="rev-card-title">{{ rev.title }}</h4>
                  <p class="rev-body">"{{ rev.comment }}"</p>
                  <div class="rev-author-row">
                    <div class="rev-avatar">{{ rev.name[0] }}</div>
                    <div class="rev-details">
                      <span class="rev-name">{{ rev.name }}</span>
                      <span class="rev-company">{{ rev.company }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>




      <!-- VIDEO MODAL -->
      @if (activeVideoReel()) {
        <div class="video-modal-backdrop" (click)="closeVideoModal()">
          <div class="video-modal-content" (click)="$event.stopPropagation()">
            <button class="vm-close-btn" (click)="closeVideoModal()">✕</button>
            <div class="vm-video-wrap">
              <video [src]="activeVideoReel()?.videoUrl" controls autoplay playsinline class="vm-video"></video>
            </div>
            <div class="vm-footer">
              <h4>{{ activeVideoReel()?.title }}</h4>
              <p>{{ activeVideoReel()?.name }}</p>
            </div>
          </div>
        </div>
      }

      <!-- QUICK VIEW MODAL -->
      @if (quickViewProduct()) {
        <div class="quick-view-backdrop" (click)="closeQuickView()">
          <div class="quick-view-modal animate-fade-in-up" (click)="$event.stopPropagation()">
            <button class="qv-close-btn" (click)="closeQuickView()">✕</button>
            <div class="qv-grid">
              <div class="qv-gallery">
                <img [src]="quickViewProduct()?.image" [alt]="quickViewProduct()?.name" class="qv-main-img">
              </div>
              <div class="qv-details">
                <span class="gl-badge-pill">{{ quickViewProduct()?.category }}</span>
                <h3 class="qv-title">{{ quickViewProduct()?.name }}</h3>
                <div class="qv-rating">
                  <span class="star">★</span> {{ quickViewProduct()?.rating }}
                  <span class="revs">({{ quickViewProduct()?.ratingCount }} reviews)</span>
                </div>
                <div class="qv-price-row">
                  <span class="qv-price">Rs. {{ quickViewProduct()?.price }}</span>
                  @if (quickViewProduct()?.originalPrice) {
                    <span class="qv-orig">Rs. {{ quickViewProduct()?.originalPrice }}</span>
                  }
                </div>
                <p class="qv-desc">{{ quickViewProduct()?.description }}</p>

                <div class="qv-features">
                  <div>✔ In-house Precision Logo Branding</div>
                  <div>✔ Premium Gift Box Presentation</div>
                  <div>✔ Express Pan-India Delivery</div>
                </div>

                <div class="qv-actions">
                  <button class="gl-btn-primary qv-add-btn" (click)="addToCart(quickViewProduct()!); closeQuickView()">
                    Add to Cart
                  </button>
                  <a [routerLink]="['/product', quickViewProduct()?.id]" (click)="closeQuickView()" class="gl-btn-outline qv-view-btn">
                    View Full Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .gl-home-page {
      background: var(--color-bg-canvas);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .gl-section {
      padding: 40px 0;
    }

    /* ── 1. HERO SECTION ── */
    .gl-hero-section {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: clamp(500px, 80vh, 720px);
      background: #0f1015;
      max-width: var(--container-max);
      margin: 20px auto 16px;
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);

      @media (max-width: 768px) {
        margin: 12px;
        border-radius: var(--radius-lg);
        height: 520px;
        width: calc(100% - 24px);
      }
    }

    .hero-slider-track {
      display: flex;
      height: 100%;
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    .hero-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transform: scale(1.02);
      transition: transform 6s ease-out;

      @media (max-width: 768px) {
        object-position: 70% center;
      }
    }

    .hero-slide:hover .hero-bg-img {
      transform: scale(1.06);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(12, 14, 20, 0.92) 0%,
        rgba(12, 14, 20, 0.75) 45%,
        rgba(12, 14, 20, 0.35) 75%,
        rgba(12, 14, 20, 0.2) 100%
      );

      @media (max-width: 768px) {
        background: linear-gradient(
          180deg,
          rgba(12, 14, 20, 0.3) 0%,
          rgba(12, 14, 20, 0.85) 50%,
          rgba(12, 14, 20, 0.98) 100%
        );
      }
    }

    .hero-content-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      padding: 0 40px;

      @media (max-width: 768px) {
        padding: 30px 18px 48px;
        align-items: center;
      }
    }

    .hero-text-block {
      max-width: 640px;
      color: #ffffff;
      padding: 24px 0;
      z-index: 2;

      @media (max-width: 768px) {
        padding: 0;
      }
    }

    .hero-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      margin-bottom: 18px;
      backdrop-filter: blur(8px);

      @media (max-width: 768px) {
        padding: 4px 10px;
        font-size: 10px;
        margin-bottom: 12px;
      }

      .badge-sparkle {
        color: #f59e0b;
        font-size: 12px;
      }
    }

    .hero-main-title {
      font-size: clamp(30px, 4.2vw, 52px);
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      letter-spacing: -0.025em;
      margin-bottom: 16px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);

      @media (max-width: 768px) {
        font-size: 22px;
        line-height: 1.25;
        margin-bottom: 8px;
      }
    }

    .hero-subtext {
      font-size: clamp(14px, 1.6vw, 17px);
      color: #e2e8f0;
      line-height: 1.6;
      margin-bottom: 28px;
      max-width: 560px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);

      @media (max-width: 768px) {
        font-size: 12px;
        margin-bottom: 16px;
        line-height: 1.4;
      }
    }

    .hero-btn-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: row;
        gap: 8px;

        .hero-btn-main, .hero-btn-sub {
          padding: 11px 18px;
          font-size: 13px;
        }
      }

      .hero-btn-main {
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        color: #111111;
        font-weight: 700;
        font-size: 15px;
        border: none;
        padding: 14px 30px;
        border-radius: var(--radius-full);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        display: inline-flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(245, 158, 11, 0.5);
          background: linear-gradient(135deg, #f0c75e 0%, #fbbf24 100%);
        }
      }

      .hero-btn-sub {
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-weight: 600;
        font-size: 15px;
        padding: 14px 28px;
        border-radius: var(--radius-full);
        transition: all 0.3s ease;

        &:hover {
          background: #ffffff;
          color: #111111;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
        }
      }
    }

    .hero-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(17, 19, 28, 0.65);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.25s ease;
      opacity: 0;

      &.prev { left: 24px; }
      &.next { right: 24px; }

      &:hover {
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        color: #111111;
        border-color: #d4af37;
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    .gl-hero-section:hover .hero-nav-btn {
      opacity: 1;
    }

    .hero-indicators {
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;

      .indicator-dot {
        width: 32px;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.35);
        border: none;
        cursor: pointer;
        padding: 0;
        transition: all 0.3s;

        &.active {
          background: #f59e0b;
          width: 52px;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
        }
      }
    }

    /* ── TRUST BAR ── */
    .hero-trust-bar {
      max-width: var(--container-max);
      margin: 0 auto 36px;
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
      border: 1px solid #ebe7df;
      padding: 18px 28px;

      @media (max-width: 768px) {
        margin: -2px 10px 22px;
        padding: 10px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      }
    }

    .trust-bar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 0;

      @media (max-width: 992px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      @media (max-width: 768px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;

      @media (max-width: 768px) {
        background: #fbf9f4;
        border: 1px solid #ede8dc;
        border-radius: 12px;
        padding: 9px 8px;
        gap: 8px;
      }

      .trust-icon {
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #fbf9f4;
        border: 1px solid #eee8db;
        flex-shrink: 0;

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
          font-size: 15px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e7e2d5;
        }
      }

      .trust-text {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        strong {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.25;

          @media (max-width: 768px) {
            font-size: 11px;
            font-weight: 700;
            line-height: 1.2;
            color: #11141c;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        span {
          font-size: 12px;
          color: #71717a;
          margin-top: 2px;

          @media (max-width: 768px) {
            font-size: 9.5px;
            color: #78716c;
            line-height: 1.2;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .trust-divider {
      width: 1px;
      height: 38px;
      background: #eee8db;

      @media (max-width: 992px) {
        display: none;
      }
    }

    /* ── 2. INSIDE GIFTAURA (Reels) ── */
    .inside-gl-section {
      background: #fbfaf8;
      border-top: 1px solid #eee8db;
      border-bottom: 1px solid #eee8db;
      padding: 50px 0;
    }

    .reels-grid {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 16px;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }

      @media (min-width: 640px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        overflow-x: visible;
        padding-bottom: 0;
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
      }
    }

    .reel-card {
      flex: 0 0 72%;
      scroll-snap-align: start;
      background: #0f1118;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #ebe6dc;
      cursor: pointer;
      position: relative;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

      @media (min-width: 640px) {
        flex: auto;
      }

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 16px 36px rgba(245, 158, 11, 0.15);
        border-color: #d4af37;

        .play-circle {
          transform: scale(1.15);
          background: #ffffff;
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.6);
        }

        .reel-img {
          transform: scale(1.08);
        }
      }
    }

    .reel-thumb-frame {
      position: relative;
      width: 100%;
      aspect-ratio: 9 / 14;
      background: #11141c;
      overflow: hidden;

      .reel-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
    }

    .reel-top-bar {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 4;

      .reel-live-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 17, 24, 0.7);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        border: 1px solid rgba(255, 255, 255, 0.15);

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulse 1.8s infinite;
        }
      }
    }

    .reel-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }

    .play-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      padding-left: 2px;
    }

    .reel-bottom-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px 14px 14px;
      background: linear-gradient(180deg, transparent 0%, rgba(10, 12, 18, 0.95) 100%);
      z-index: 4;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .reel-tag-badge {
        font-size: 11px;
        font-weight: 700;
        color: #fbbf24;
      }

      .reel-title {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .reel-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #f59e0b;
        margin-top: 2px;
        transition: transform 0.2s ease;

        svg {
          transition: transform 0.2s ease;
        }
      }
    }

    .reel-card:hover .reel-action-btn svg {
      transform: translateX(4px);
    }

    /* ── 3. TRENDING PRODUCTS ── */
    .trending-section {
      background: var(--color-bg-canvas);
      padding: 60px 0;
    }

    .gl-filter-tabs {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 36px;

      @media (max-width: 768px) {
        flex-wrap: nowrap;
        justify-content: flex-start;
        overflow-x: auto;
        padding: 0 16px 8px;
        margin: 0 -16px 28px;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .filter-tab {
        flex-shrink: 0;
        white-space: nowrap;
        background: #ffffff;
        color: #4b5563;
        border: 1px solid #e5e0d4;
        border-radius: var(--radius-full);
        padding: 10px 22px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          border-color: #d4af37;
          color: #111111;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        &.active {
          background: #11141c;
          color: #fbbf24;
          border-color: #11141c;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(17, 20, 28, 0.2);
          transform: translateY(-2px);
        }
      }
    }

    .gl-products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 28px;
      }
    }

    .gl-product-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #ebe5d8;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 36px rgba(27, 33, 59, 0.09);
        border-color: #d8cebd;

        .pcard-img.hover-img {
          opacity: 1;
        }

        .pcard-img.main-img {
          transform: scale(1.06);
        }

        .pcard-quick-actions {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }

    .pcard-badge-row {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 5;
      pointer-events: none;
    }

    .badge-bestseller {
      background: #11141c;
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 3px;

      .badge-icon {
        color: #f59e0b;
        font-size: 11px;
      }
    }

    .badge-discount {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
      margin-left: auto;
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
      background: #fcfbf9;
      overflow: hidden;

      .pcard-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        inset: 0;
        transition: opacity 0.35s ease, transform 0.5s ease;

        &.hover-img {
          opacity: 0;
        }
      }
    }

    .pcard-quick-actions {
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      gap: 6px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 6;

      @media (max-width: 768px) {
        opacity: 1;
        transform: translateY(0);
      }

      .quick-view-action-btn {
        flex: 1;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        color: #1a1a1a;
        border: 1px solid #e5e0d4;
        border-radius: var(--radius-full);
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #11141c;
          color: #ffffff;
          border-color: #11141c;
        }

        @media (max-width: 768px) {
          display: none;
        }
      }

      .quick-add-btn {
        flex: 1.3;
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        color: #111111;
        border: none;
        border-radius: var(--radius-full);
        padding: 9px 12px;
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);

        &:hover {
          background: linear-gradient(135deg, #e5b958 0%, #fbbf24 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(245, 158, 11, 0.45);
        }

        @media (max-width: 768px) {
          flex: 1;
          padding: 8px 10px;
          font-size: 11px;
        }
      }
    }

    .pcard-body {
      padding: 14px 16px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;

      @media (max-width: 767px) {
        padding: 10px 10px 14px;
      }

      .pcard-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 6px;

        .star { color: #f59e0b; font-size: 13px; }
        .rating-val { font-weight: 700; color: #111; }
        .rating-count { color: #9ca3af; font-size: 11.5px; }
      }

      .pcard-title {
        font-size: 14.5px;
        font-weight: 700;
        color: #18191f;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 40px;
        margin-bottom: 12px;
        transition: color 0.2s;

        @media (max-width: 767px) {
          font-size: 13px;
          min-height: 36px;
          margin-bottom: 8px;
        }

        &:hover { color: #d4af37; }
      }

      .pcard-price-row {
        margin-top: auto;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;

        @media (max-width: 767px) {
          gap: 5px;
        }

        .price-current {
          font-size: 17px;
          font-weight: 800;
          color: #11141c;
          letter-spacing: -0.02em;

          @media (max-width: 767px) {
            font-size: 15px;
          }
        }

        .price-original {
          font-size: 12.5px;
          color: #9ca3af;
          text-decoration: line-through;

          @media (max-width: 767px) {
            font-size: 11.5px;
          }
        }

        .price-save {
          font-size: 10.5px;
          font-weight: 700;
          color: #15803d;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;

          @media (max-width: 767px) {
            display: none;
          }
        }
      }
    }

    .view-all-row {
      text-align: center;
      margin-top: 48px;

      .view-all-btn {
        background: linear-gradient(135deg, #11141c 0%, #1e2230 100%);
        color: #ffffff;
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 15px 36px;
        border-radius: var(--radius-full);
        font-size: 15px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);

        &:hover {
          background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
          color: #111111;
          border-color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(245, 158, 11, 0.35);
        }
      }
    }

    /* ── 4. FEATURE CARDS GRID ── */
    .feature-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;

      @media (max-width: 767px) {
        flex-direction: row;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 8px;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
      }

      @media (min-width: 768px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .feature-card {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      aspect-ratio: 4 / 3;

      @media (max-width: 767px) {
        flex: 0 0 85%;
        scroll-snap-align: center;
      }

      .fc-bg-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    /* ── 6. TRUST BANNER ── */
    .trust-banner-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: var(--shadow-sm);

      .trust-title {
        font-size: clamp(20px, 3vw, 28px);
        font-weight: 800;
        color: #111111;
        margin-bottom: 32px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }
    }

    .trust-stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      text-align: left;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .trust-stat-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #faf8f5;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #eeebe6;

      .trust-check {
        font-size: 20px;
      }

      .trust-text {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 14.5px;
          color: #111111;
          margin-bottom: 3px;
        }

        span {
          font-size: 12.5px;
          color: #666666;
        }
      }
    }

    /* ── 7. WHY CHOOSE US ── */
    .why-choose-section {
      background: #ffffff;
      padding: 60px 0;
    }

    .why-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 36px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }
    }

    .why-card {
      text-align: center;
      padding: 36px 24px;
      position: relative;
      background: #ffffff;
      border: 1px solid #ebe5d8;
      border-radius: 18px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: transparent;
        transition: background 0.3s ease;
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 36px rgba(27, 33, 59, 0.09);
        border-color: #d4af37;

        &::before {
          background: linear-gradient(90deg, #d4af37, #f59e0b);
        }

        .why-icon-box {
          transform: scale(1.1);
          background: #fde68a;
        }
      }

      .why-icon-box {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        background: #fef3c7;
        border: 1px solid #fde68a;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        transition: all 0.3s ease;
      }

      .why-card-title {
        font-size: 16px;
        font-weight: 800;
        color: #11141c;
        margin-bottom: 10px;
        letter-spacing: -0.01em;
      }

      .why-card-desc {
        font-size: 13.5px;
        color: #52525b;
        line-height: 1.6;
      }
    }

    /* ── 8. REVIEWS ── */
    .reviews-section {
      background: #fbfaf8;
      border-top: 1px solid #eee8db;
      padding: 60px 0;
    }

    .reviews-wrapper {
      position: relative;
      margin-top: 36px;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .review-card {
      background: #ffffff;
      border: 1px solid #ebe5d8;
      border-radius: 18px;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        border-color: #d4af37;
      }

      .rev-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }

      .rev-stars {
        color: #f59e0b;
        font-size: 15px;
        letter-spacing: 2px;
      }

      .rev-verified-pill {
        display: inline-flex;
        align-items: center;
        background: #ecfdf5;
        color: #15803d;
        border: 1px solid #a7f3d0;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-full);
      }

      .rev-card-title {
        font-size: 15.5px;
        font-weight: 800;
        color: #11141c;
        margin-bottom: 8px;
        line-height: 1.35;
      }

      .rev-body {
        font-size: 13.5px;
        color: #52525b;
        line-height: 1.65;
        margin-bottom: 24px;
        flex: 1;
      }

      .rev-author-row {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid #f4f1ea;

        .rev-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #11141c 0%, #2a2c36 100%);
          color: #fbbf24;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .rev-details {
          display: flex;
          flex-direction: column;

          .rev-name {
            font-size: 14.5px;
            font-weight: 700;
            color: #11141c;
          }

          .rev-company {
            font-size: 12px;
            color: #71717a;
            margin-top: 2px;
          }
        }
      }
    }



    /* ── 9. INQUIRY SECTION ── */
    .inquiry-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      box-shadow: var(--shadow-md);

      @media (min-width: 992px) {
        grid-template-columns: 1fr 1.2fr;
        padding: 50px;
        gap: 40px;
      }
    }

    .inquiry-title {
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 800;
      color: #111111;
      margin: 14px 0 10px;
    }

    .inquiry-sub {
      font-size: 14px;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .inquiry-perks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 30px;

      .perk-item {
        font-size: 13.5px;
        font-weight: 600;
        color: #27ae60;
      }
    }

    .inquiry-direct {
      span {
        display: block;
        font-size: 12.5px;
        color: #777;
        margin-bottom: 8px;
      }

      .inquiry-wa-btn {
        display: inline-block;
        background: #25D366;
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        padding: 10px 18px;
        border-radius: 6px;
        transition: background 0.2s;
        &:hover { background: #1eb956; }
      }
    }

    .inquiry-form {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .form-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        
        @media (min-width: 640px) {
          grid-template-columns: 1fr 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 12.5px;
          font-weight: 700;
          color: #333333;
        }

        input, select, textarea {
          border: 1px solid #dcd7cf;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          color: #111111;
          background: #faf8f5;
          outline: none;
          transition: border-color 0.2s;

          &:focus {
            border-color: #111111;
            background: #ffffff;
          }
        }
      }

      .inquiry-submit-btn {
        width: 100%;
        padding: 14px;
        font-size: 15px;
        margin-top: 8px;
      }

      .inquiry-success-msg {
        background: #e8f5e9;
        color: #2e7d32;
        font-size: 13px;
        font-weight: 600;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #c8e6c9;
      }
    }

    /* ── VIDEO MODAL (SLIDE PANEL) ── */
    .video-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      justify-content: flex-end; /* Align right */
    }

    .video-modal-content {
      position: relative;
      width: 100%;
      max-width: 420px;
      height: 100%;
      background: #111111;
      overflow-y: auto;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;

      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }

      .vm-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0,0,0,0.6);
        color: #ffffff;
        font-size: 18px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vm-video-wrap {
        width: 100%;
        aspect-ratio: 9 / 16;
        background: #000;

        .vm-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .vm-footer {
        padding: 16px;
        color: #ffffff;

        h4 { font-size: 15px; color: #fff; margin-bottom: 2px; }
        p { font-size: 12px; color: #aaa; margin: 0; }
      }
    }

    /* ── QUICK VIEW MODAL ── */
    .quick-view-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .quick-view-modal {
      position: relative;
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
      max-height: 90vh;
      overflow-y: auto;

      .qv-close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #f0ece6;
        color: #333;
        font-size: 18px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover { background: #111; color: #fff; }
      }
    }

    .qv-grid {
      display: grid;
      grid-template-columns: 1fr;
      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .qv-gallery {
      background: #f9f7f4;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;

      .qv-main-img {
        max-height: 400px;
        width: 100%;
        object-fit: cover;
        border-radius: 10px;
      }
    }

    .qv-details {
      padding: 32px;
      display: flex;
      flex-direction: column;

      .qv-title {
        font-size: 20px;
        font-weight: 800;
        color: #111;
        margin: 12px 0 8px;
      }

      .qv-rating {
        font-size: 13px;
        color: #444;
        margin-bottom: 12px;
        .star { color: #f59e0b; }
        .revs { color: #888; margin-left: 4px; }
      }

      .qv-price-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin-bottom: 16px;

        .qv-price {
          font-size: 22px;
          font-weight: 800;
          color: #111;
        }

        .qv-orig {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }
      }

      .qv-desc {
        font-size: 13.5px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .qv-features {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12.5px;
        color: #27ae60;
        font-weight: 600;
        margin-bottom: 24px;
      }

      .qv-actions {
        display: flex;
        gap: 10px;
        margin-top: auto;

        .qv-add-btn { flex: 1.2; }
        .qv-view-btn { flex: 1; }
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  readonly currentHeroIndex = signal<number>(0);
  readonly selectedCategory = signal<string>('all');
  private heroTimer: any;

  readonly activeVideoReel = signal<ReelItem | null>(null);
  readonly quickViewProduct = signal<Product | null>(null);
  readonly inquirySubmitted = signal<boolean>(false);

  inquiryForm = {
    name: '',
    company: '',
    phone: '',
    product: 'Customized Polo T-Shirts',
    quantity: 50,
    message: ''
  };

  heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: 'Custom Polo T-Shirts with Company Logo Printing',
      subtitle: 'Corporate uniforms, coaching institutes & brand merchandise with HD printing & embroidery in 14 colors.',
      badge: 'FACTORY DIRECT MERCHANDISE',
      btnText: 'Shop T-Shirts Collection',
      btnLink: '/menu',
      queryParams: { cat: 't-shirts' },
      image: '/assets/images/hero/hero-polo-tshirts.jpg'
    },
    {
      id: 2,
      title: 'Premium Corporate Gifts & Executive Welcome Kits',
      subtitle: 'Branded executive organizers, vacuum flasks, card holders and pen sets in luxury presentation gift packaging.',
      badge: 'EMPLOYEE ONBOARDING ESSENTIALS',
      btnText: 'Explore Welcome Kits',
      btnLink: '/menu',
      queryParams: { cat: 'welcome-kits' },
      image: '/assets/images/hero/hero-welcome-kits.jpg'
    },
    {
      id: 3,
      title: 'Engraved Metal Pens, Keychains & Magnetic Badges',
      subtitle: 'Crisp German laser engraving, premium metallic finish and pin-free magnetic badges for professional teams.',
      badge: 'PRECISION LASER BRANDING',
      btnText: 'Shop Pens & Badges',
      btnLink: '/menu',
      queryParams: { cat: 'corporate-gifts' },
      image: '/assets/images/hero/hero-pens-badges.jpg'
    }
  ];

  reelsList: ReelItem[] = [
    {
      id: 'r1',
      title: 'Fast Dispatch & Packing',
      name: '📦 Express Dispatches',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/cd854d3a64ae4a24892af26e1fe10166.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-db641504-ad47-495a-b70a-1dc91e730c6d.jpg?v=1780236830'
    },
    {
      id: 'r2',
      title: 'Precision Laser Engraving',
      name: '⚡ Laser Branding Live',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/b7d6c073471d49edbdde6438f98f01f9.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-602e0161-66c4-43a6-9f19-dcf24ddaf74b.jpg?v=1780236833'
    },
    {
      id: 'r3',
      title: 'QC & Secure Transit',
      name: '🛡️ 100% Quality Check',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/220b72f13d564edb9aa0c318f0830370.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-af178473-47d6-4b0c-b1a9-58ec4ec8a4e9.jpg?v=1780236825'
    },
    {
      id: 'r4',
      title: 'Executive Pen Sets',
      name: '✨ Luxury Presentation',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/721c337d37af4aafa74bc573eb58051a.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-c7465a99-1bf5-47a6-8ff9-5fc2d4a2fdde.jpg?v=1780235538'
    },
    {
      id: 'r5',
      title: 'In-House Machinery',
      name: '🏭 Factory Operations',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/922c0e5e7e2d4a8da1d151f3b87e2f38.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-26e7721a-21db-4763-a88e-20ceddeb9d6f.jpg?v=1780236800'
    }
  ];

  customerReviews = [
    {
      name: 'Vikas Sharma',
      company: 'Utkarsh Classes, Jodhpur',
      title: 'Outstanding T-Shirts & Badge Quality!',
      comment: 'Ordered 1,200 polo t-shirts and magnetic badges for our coaching educators. The embroidery was crisp, fabric breathable, and delivery was 2 days ahead of schedule.'
    },
    {
      name: 'Neha Kapoor',
      company: 'TalentHR Solutions, Gurgaon',
      title: 'Flawless Welcome Kits for our New Hires',
      comment: 'The 3-in-1 executive welcome gift boxes with our company logo looked extremely premium. The packaging and custom laser engraving on pens impressed our executives.'
    },
    {
      name: 'Manish Jain',
      company: 'Apex Logistics, Jaipur',
      title: 'Great pricing and prompt WhatsApp support',
      comment: 'Rohit from GiftAura handled our urgent requirement of 500 insulated bottles and diaries with utmost professionalism. GiftAura is now our permanent corporate vendor.'
    }
  ];

  allProducts = computed(() => this.productService.getAll());

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const list = this.allProducts();
    if (cat === 'all') return list;
    return list.filter(p => p.category === cat);
  });

  private pendingCartItem = signal<{ product: Product, qty: number } | null>(null);

  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn() && this.pendingCartItem()) {
        const item = this.pendingCartItem()!;
        this.cartService.addToCart(item.product, item.qty);
        this.cartService.openDrawer();
        this.pendingCartItem.set(null);
        this.authService.closeAuthModal();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.startHeroAutoplay();
  }

  ngAfterViewInit() {
    // Force autoplay on reel videos (browsers block autoplay without user gesture on deployed sites)
    setTimeout(() => {
      const videos = this.document.querySelectorAll<HTMLVideoElement>('video.reel-img');
      videos.forEach(video => {
        video.muted = true;
        video.play().catch(() => {
          // silently ignore if blocked
        });
      });
    }, 500);
  }

  ngOnDestroy() {
    this.stopHeroAutoplay();
  }

  private startHeroAutoplay() {
    this.heroTimer = setInterval(() => {
      this.currentHeroIndex.update(idx => (idx + 1) % this.heroSlides.length);
    }, 5000);
  }

  private stopHeroAutoplay() {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
  }

  setHeroIndex(index: number) {
    this.currentHeroIndex.set(index);
    this.stopHeroAutoplay();
    this.startHeroAutoplay();
  }

  nextHeroSlide() {
    this.currentHeroIndex.update(idx => (idx + 1) % this.heroSlides.length);
    this.stopHeroAutoplay();
    this.startHeroAutoplay();
  }

  prevHeroSlide() {
    this.currentHeroIndex.update(idx => (idx - 1 + this.heroSlides.length) % this.heroSlides.length);
    this.stopHeroAutoplay();
    this.startHeroAutoplay();
  }

  getDiscountPercent(price: number, origPrice?: number): number {
    if (!origPrice || origPrice <= price) return 0;
    return Math.round(((origPrice - price) / origPrice) * 100);
  }

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.pendingCartItem.set({ product, qty: 1 });
      this.cartService.openDrawer();
      return;
    }
    this.cartService.addToCart(product, 1);
    this.cartService.openDrawer();
  }

  openQuickView(product: Product) {
    this.quickViewProduct.set(product);
  }

  closeQuickView() {
    this.quickViewProduct.set(null);
  }

  openVideoModal(reel: ReelItem) {
    this.activeVideoReel.set(reel);
  }

  closeVideoModal() {
    this.activeVideoReel.set(null);
  }

  submitInquiry(e: Event) {
    e.preventDefault();
    this.inquirySubmitted.set(true);

    // Pre-fill WhatsApp message
    const msg = `*New Bulk Inquiry from Website*%0A*Name:* ${this.inquiryForm.name}%0A*Company:* ${this.inquiryForm.company}%0A*Phone:* ${this.inquiryForm.phone}%0A*Product:* ${this.inquiryForm.product}%0A*Quantity:* ${this.inquiryForm.quantity}%0A*Message:* ${this.inquiryForm.message || 'None'}`;
    window.open(`https://wa.me/918461909143?text=${msg}`, '_blank');
  }
}
