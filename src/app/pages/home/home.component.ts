import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
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
                  <span class="hero-badge-pill">{{ slide.badge }}</span>
                  <h1 class="hero-main-title">{{ slide.title }}</h1>
                  <p class="hero-subtext">{{ slide.subtitle }}</p>
                  <div class="hero-btn-row">
                    <a [routerLink]="slide.btnLink" [queryParams]="slide.queryParams" class="gl-btn-primary hero-btn-main">
                      {{ slide.btnText }}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

        <!-- HERO CONTROLS -->
        <div class="hero-indicators">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <button class="indicator-dot" [class.active]="currentHeroIndex() === i" (click)="setHeroIndex(i)" [attr.aria-label]="'Go to slide ' + (i + 1)"></button>
          }
        </div>
      </section>

      <!-- 2. INSIDE GRAPHIC LINE (Behind-the-scenes Reels & Factory) -->
      <section class="gl-section inside-gl-section">
        <div class="container">
          <div class="gl-section-header">
            <span class="gl-section-pill gl-badge-pill">BEHIND THE SCENES</span>
            <h2 class="gl-section-title">Inside Graphic Line</h2>
            <p class="gl-section-subtitle">Real look into our in-house manufacturing, precision laser engraving & daily order dispatches.</p>
          </div>

          <div class="reels-slider-wrap">
            <div class="reels-grid">
              @for (reel of reelsList; track reel.id) {
                <div class="reel-card" (click)="openVideoModal(reel)">
                  <div class="reel-thumb-frame">
                    <video [src]="reel.videoUrl" class="reel-img" autoplay muted loop playsinline></video>
                    <div class="reel-play-overlay">
                      <div class="play-circle">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                    <div class="reel-tag-badge">{{ reel.name }}</div>
                  </div>
                  <div class="reel-meta">
                    <h4 class="reel-title">{{ reel.title }}</h4>
                    <span class="reel-action">Watch Reel ›</span>
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
            <span class="gl-section-pill gl-badge-pill">OUR BESTSELLERS</span>
            <h2 class="gl-section-title">Trending Corporate Gifts</h2>
            <p class="gl-section-subtitle">Laser engraved executive pens, customized keychains, mobile stands & premium welcome gift sets.</p>
          </div>

          <!-- CATEGORY PILL FILTER -->
          <div class="gl-filter-tabs">
            <button class="filter-tab" [class.active]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">
              All Products
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'corporate-gifts'" (click)="selectedCategory.set('corporate-gifts')">
              Pens & Diaries
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'welcome-kits'" (click)="selectedCategory.set('welcome-kits')">
              Welcome Kits
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 't-shirts'" (click)="selectedCategory.set('t-shirts')">
              Customized T-Shirts
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'keychains-badges'" (click)="selectedCategory.set('keychains-badges')">
              Keychains & Badges
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'office-essentials'" (click)="selectedCategory.set('office-essentials')">
              Office Essentials
            </button>
            <button class="filter-tab" [class.active]="selectedCategory() === 'drinkware'" (click)="selectedCategory.set('drinkware')">
              Vacuum Flasks
            </button>
          </div>

          <!-- PRODUCTS GRID -->
          <div class="gl-products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="gl-product-card">
                <!-- BADGES -->
                @if (product.isBestseller) {
                  <span class="badge-bestseller">BESTSELLER</span>
                }
                @if (product.originalPrice && product.originalPrice > product.price) {
                  <span class="badge-discount">
                    {{ getDiscountPercent(product.price, product.originalPrice) }}% OFF
                  </span>
                }

                <!-- MEDIA BOX (Image + Overlay Actions) -->
                <div class="pcard-media-box">
                  <!-- IMAGE CONTAINER WITH DUAL-IMAGE HOVER -->
                  <a [routerLink]="['/product', product.id]" class="pcard-img-link">
                    <div class="pcard-img-wrap">
                      <img [src]="product.image" [alt]="product.name" class="pcard-img main-img">
                      @if (product.secondaryImage && product.secondaryImage !== product.image) {
                        <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img">
                      }
                    </div>
                  </a>

                  <!-- QUICK ACTIONS -->
                  <div class="pcard-quick-actions">
                    <button class="quick-add-btn" (click)="addToCart(product)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
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
                    <span class="price-current">Rs. {{ product.price }}.00</span>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="price-original">Rs. {{ product.originalPrice }}.00</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="view-all-row">
            <a routerLink="/menu" class="gl-btn-primary">
              View All {{ allProducts().length }} Products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </section>


      <!-- 7. WHY CHOOSE GRAPHIC LINE -->
      <section class="gl-section why-choose-section" id="why-choose">
        <div class="container">
          <div class="gl-section-header left-aligned">
            <h2 class="gl-section-title">Why Choose Graphic Line?</h2>
          </div>

          <div class="why-grid">
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 class="why-card-title">Premium Quality</h3>
              <p class="why-card-desc">Top-notch materials & print quality.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
              </div>
              <h3 class="why-card-title">Custom Printing</h3>
              <p class="why-card-desc">Your logo, your design, our expertise.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <h3 class="why-card-title">Bulk Discounts</h3>
              <p class="why-card-desc">Best prices for large orders.</p>
            </div>
            <div class="why-card">
              <div class="why-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h3 class="why-card-title">Fast & Reliable Delivery</h3>
              <p class="why-card-desc">On-time delivery across India.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. REVIEWS & TESTIMONIALS -->
      <section class="gl-section reviews-section">
        <div class="container">
          <div class="gl-section-header left-aligned">
            <h2 class="gl-section-title">What Our Customers Say</h2>
            <p class="gl-section-subtitle">Trusted by 10,000+ happy customers</p>
          </div>

          <div class="reviews-wrapper">
            <button class="review-nav prev" aria-label="Previous Review">❮</button>
            
            <div class="reviews-grid">
              @for (rev of customerReviews; track rev.name) {
                <div class="review-card">
                  <div class="rev-stars">★★★★★</div>
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

            <button class="review-nav next" aria-label="Next Review">❯</button>
          </div>
          <div class="review-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
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
                  <span class="qv-price">Rs. {{ quickViewProduct()?.price }}.00</span>
                  @if (quickViewProduct()?.originalPrice) {
                    <span class="qv-orig">Rs. {{ quickViewProduct()?.originalPrice }}.00</span>
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
      height: clamp(480px, 78vh, 700px);
      background: #111111;
      max-width: var(--container-max);
      margin: 20px auto;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);

      @media (max-width: 768px) {
        margin: 16px;
        border-radius: var(--radius-lg);
        height: 45vh;
        min-height: 400px; 
        width: calc(100% - 32px);
      }
    }

    .hero-slider-track {
      display: flex;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
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
      
      @media (max-width: 768px) {
        object-position: top center; /* Helps show the main part of image on mobile */
      }
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.75) 0%,
        rgba(0, 0, 0, 0.45) 50%,
        rgba(0, 0, 0, 0.2) 100%
      );
    }

    .hero-content-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
    }

    .hero-text-block {
      max-width: 650px;
      color: #ffffff;
      padding: 20px 0;
      
      @media (max-width: 768px) {
        padding: 24px 0; /* Reduced extra padding to fit in smaller height */
      }
    }

    .hero-badge-pill {
      display: inline-block;
      background: #a6893b;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      margin-bottom: 16px;
    }

    .hero-main-title {
      font-size: clamp(28px, 4.5vw, 54px);
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      letter-spacing: -0.03em;
      margin-bottom: 16px;

      @media (max-width: 768px) {
        font-size: 24px;
        margin-bottom: 10px;
      }
    }

    .hero-subtext {
      font-size: clamp(14px, 1.8vw, 17px);
      color: #e5e5e5;
      line-height: 1.6;
      margin-bottom: 28px;

      @media (max-width: 768px) {
        font-size: 13px;
        margin-bottom: 18px;
        line-height: 1.4;
      }
    }

    .hero-btn-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px; /* tighter spacing on mobile to save vertical space */
      }

      .hero-btn-main {
        background: var(--color-accent);
        color: #111111;
        font-weight: 700;
        border: none;
        padding: 14px 28px;
        border-radius: var(--radius-full);
        &:hover { background: var(--color-accent-hover); }
      }

      .hero-btn-sub {
        border-color: #ffffff;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: var(--radius-full);
        &:hover { background: #ffffff; color: #111111; }
      }
    }

    .hero-indicators {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;

      .indicator-dot {
        width: 32px;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.4);
        transition: all 0.3s;

        &.active {
          background: #ffffff;
          width: 48px;
        }
      }
    }

    /* ── 2. INSIDE GRAPHIC LINE (Reels) ── */
    .inside-gl-section {
      background: #faf8f5;
      border-bottom: 1px solid var(--color-border);
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
      flex: 0 0 65%; /* Shows 1 full card and a part of the next on mobile */
      scroll-snap-align: start;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.3s ease;

      @media (min-width: 640px) {
        flex: auto; /* Reset flex for grid on desktop */
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-lg);

        .play-circle {
          transform: scale(1.15);
          background: #25D366;
        }
      }
    }

    .reel-thumb-frame {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 5; /* Changed from 9/16 to make it less tall (shorter) */
      background: #222;
      overflow: hidden;

      @media (max-width: 768px) {
        aspect-ratio: 1 / 1; /* Makes it completely square, reducing height further on mobile */
      }

      .reel-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      &:hover .reel-img {
        transform: scale(1.05);
      }
    }

    .reel-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .play-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
      padding-left: 3px;
    }

    .reel-tag-badge {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      backdrop-filter: blur(2px);
    }

    .reel-meta {
      padding: 12px;

      .reel-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #111111;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .reel-action {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-accent);
      }
    }

    /* ── 3. TRENDING PRODUCTS ── */
    .trending-section {
      background: var(--color-bg-canvas);
    }

    .gl-filter-tabs {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 40px;

      @media (max-width: 768px) {
        flex-wrap: nowrap;
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 8px;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .filter-tab {
        flex-shrink: 0;
        white-space: nowrap;
        background: #ffffff;
        color: #333333;
        border: 1px solid var(--color-border);
        border-radius: 999px;
        padding: 9px 20px;
        font-size: 13.5px;
        font-weight: 600;
        transition: all 0.2s ease;

        &:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        &.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
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
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
        border-color: #d6cfc5;

        .pcard-img.hover-img {
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

    .pcard-quick-actions {
      position: absolute;
      bottom: 12px; /* Positioned at the very bottom of the image */
      left: 12px;
      right: 12px;
      display: flex;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.3s ease;
      z-index: 6;

      @media (max-width: 768px) {
        opacity: 1; /* Always visible on mobile since there is no hover */
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

    .pcard-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;

      .pcard-rating {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;

        .star { color: #f59e0b; font-size: 13px; }
        .rating-val { font-weight: 700; color: #111; }
      }

      .pcard-title {
        font-size: 14px;
        font-weight: 700;
        color: #111111;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 38px;
        margin-bottom: 10px;
        transition: color 0.2s;

        &:hover { color: var(--color-accent); }
      }

      .pcard-price-row {
        margin-top: auto;
        display: flex;
        align-items: baseline;
        gap: 6px;
        flex-wrap: wrap;

        .price-current {
          font-size: 14px;
          font-weight: 800;
          color: #111111;
          white-space: nowrap;
        }

        .price-original {
          font-size: 11.5px;
          color: #999999;
          text-decoration: line-through;
          white-space: nowrap;
        }
      }
    }

    .view-all-row {
      text-align: center;
      margin-top: 48px;
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
      padding: 40px 0;
    }

    .why-grid {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 12px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      @media (min-width: 640px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        overflow-x: visible;
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
      }
    }

    .why-card {
      text-align: center;
      padding: 24px 16px;
      position: relative;
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      flex: 0 0 45%;
      scroll-snap-align: start;

      @media (min-width: 640px) {
        flex: auto;
      }

      @media (min-width: 1024px) {
        border: none;
        border-radius: 0;
        border-right: 1px solid #eaeaea;
        padding: 0 20px;
        background: transparent;

        &:last-child {
          border-right: none;
        }
      }

      .why-icon-box {
        margin-bottom: 16px;
      }

      .why-card-title {
        font-size: 14px;
        font-weight: 800;
        color: #111111;
        margin-bottom: 8px;
        
        @media (min-width: 1024px) {
          font-size: 16px;
          margin-bottom: 10px;
        }
      }

      .why-card-desc {
        font-size: 12px;
        color: #666666;
        line-height: 1.4;
        
        @media (min-width: 1024px) {
          font-size: 13.5px;
          line-height: 1.55;
        }
      }
    }

    /* ── 8. REVIEWS ── */
    .reviews-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .review-nav {
      background: none;
      border: none;
      font-size: 24px;
      color: #111111;
      cursor: pointer;
      display: none; /* hidden on small screens */

      @media (min-width: 1024px) {
        display: block;
      }
    }

    .reviews-grid {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 20px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      @media (min-width: 768px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        overflow-x: visible;
        padding-bottom: 0;
      }
    }

    .review-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      flex: 0 0 85%;
      scroll-snap-align: center;

      @media (min-width: 768px) {
        flex: auto;
      }

      .rev-stars {
        color: #f59e0b;
        font-size: 16px;
        margin-bottom: 16px;
        letter-spacing: 2px;
      }

      .rev-body {
        font-size: 14px;
        color: #444444;
        line-height: 1.6;
        margin-bottom: 24px;
        flex: 1;
        font-style: italic;
      }

      .rev-author-row {
        display: flex;
        align-items: center;
        gap: 14px;

        .rev-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #475569;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          object-fit: cover;
        }

        .rev-details {
          display: flex;
          flex-direction: column;

          .rev-name {
            font-size: 14px;
            font-weight: 700;
            color: #111111;
          }

          .rev-company {
            font-size: 12px;
            color: #64748b;
          }
        }
      }
    }

    .review-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 24px;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #cbd5e1;
        
        &.active {
          background: #1e293b;
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
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

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
      image: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/customized-polo-tshirts-14-colors-logo-printing_7013747c-8aee-474d-a925-ca2c44ea933f.webp?v=1780224409&width=3840'
    },
    {
      id: 2,
      title: 'Premium Corporate Gifts & Executive Welcome Kits',
      subtitle: 'Branded executive organizers, vacuum flasks, card holders and pen sets in luxury presentation gift packaging.',
      badge: 'EMPLOYEE ONBOARDING ESSENTIALS',
      btnText: 'Explore Welcome Kits',
      btnLink: '/menu',
      queryParams: { cat: 'welcome-kits' },
      image: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/1_da9619cd-aebf-41cf-8b30-dfac4195f748.webp?v=1778759164&width=3840'
    },
    {
      id: 3,
      title: 'Engraved Metal Pens, Keychains & Magnetic Badges',
      subtitle: 'Crisp German laser engraving, premium metallic finish and pin-free magnetic badges for professional teams.',
      badge: 'PRECISION LASER BRANDING',
      btnText: 'Shop Pens & Badges',
      btnLink: '/menu',
      queryParams: { cat: 'corporate-gifts' },
      image: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/5_62ef39f6-4e85-4dc0-8bb9-b2a4561ed40a.webp?v=1778759946&width=3840'
    }
  ];

  reelsList: ReelItem[] = [
    {
      id: 'r1',
      title: 'Packaging & Dispatch',
      name: '📦 Order Processing',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/cd854d3a64ae4a24892af26e1fe10166.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-db641504-ad47-495a-b70a-1dc91e730c6d.jpg?v=1780236830'
    },
    {
      id: 'r2',
      title: 'Laser Engraving & Print',
      name: '🏭 Production in Progress',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/b7d6c073471d49edbdde6438f98f01f9.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-602e0161-66c4-43a6-9f19-dcf24ddaf74b.jpg?v=1780236833'
    },
    {
      id: 'r3',
      title: 'QC & Safe Shipping',
      name: '🚚 Quality Check & Dispatch',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/220b72f13d564edb9aa0c318f0830370.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-af178473-47d6-4b0c-b1a9-58ec4ec8a4e9.jpg?v=1780236825'
    },
    {
      id: 'r4',
      title: 'Executive Pen Sets',
      name: '🎥 Product Showcase',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/721c337d37af4aafa74bc573eb58051a.mp4',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0681/7257/8864/files/preview_images/moast-video-first-frame-c7465a99-1bf5-47a6-8ff9-5fc2d4a2fdde.jpg?v=1780235538'
    },
    {
      id: 'r5',
      title: 'In-House Machinery',
      name: '🏢 Inside Our Factory',
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
      comment: 'Akash and Ajay handled our urgent requirement of 500 insulated bottles and diaries with utmost professionalism. Graphic Line is now our permanent corporate vendor.'
    }
  ];

  allProducts = computed(() => this.productService.getAll());

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const list = this.allProducts();
    if (cat === 'all') return list;
    return list.filter(p => p.category === cat);
  });

  ngOnInit() {
    this.startHeroAutoplay();
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

  getDiscountPercent(price: number, origPrice?: number): number {
    if (!origPrice || origPrice <= price) return 0;
    return Math.round(((origPrice - price) / origPrice) * 100);
  }

  addToCart(product: Product) {
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
    window.open(`https://wa.me/917877605311?text=${msg}`, '_blank');
  }
}
