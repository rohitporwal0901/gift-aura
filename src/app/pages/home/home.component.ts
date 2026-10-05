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
                  <h1 class="hero-main-title">{{ slide.title }}</h1>
                  <div class="hero-btn-row">
                    <a [routerLink]="slide.btnLink" [queryParams]="slide.queryParams" class="gl-btn-primary hero-btn-main">
                      <span>{{ slide.btnText }}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
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
      <section class="gl-section inside-gl-section" id="workshop">
        <!-- Section Background Decoration -->
        <div class="reels-bg-decoration">
          <div class="bg-orb bg-orb-1"></div>
          <div class="bg-orb bg-orb-2"></div>
        </div>

        <div class="container">
          <div class="gl-section-header reels-header">
            <span class="reels-pill-badge">
              <span class="pill-dot"></span>
              IN-HOUSE PRODUCTION
            </span>
            <h2 class="reels-main-title">Inside the <span class="title-highlight">GiftAura</span> Workshop</h2>
            <p class="reels-subtitle">Real look into our German fiber laser engraving, HD apparel embroidery &amp; daily corporate order dispatches.</p>
          </div>

          <!-- Reels Scroll Container -->
          <div class="reels-scroll-wrapper">
            <!-- Left Nav Button -->
            <button class="reel-scroll-btn reel-scroll-left" (click)="scrollReelsLeft()" aria-label="Scroll Left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="reels-track" #reelsTrack>
              @for (reel of reelsList; track reel.id; let i = $index) {
                <div class="reel-card-v2" (click)="openVideoModal(reel)">
                  <!-- Video Background -->
                  <div class="reel-media-wrap">
                    <video [src]="reel.videoUrl" class="reel-video-bg" autoplay muted loop playsinline></video>
                    <!-- Gradient overlays -->
                    <div class="reel-gradient-top"></div>
                    <div class="reel-gradient-bottom"></div>
                  </div>

                  <!-- Top: Live Badge -->
                  <div class="reel-header-bar">
                    <div class="reel-live-indicator">
                      <span class="live-pulse"></span>
                      <span class="live-text">LIVE</span>
                    </div>
                    <div class="reel-index-num">{{ (i + 1).toString().padStart(2, '0') }}</div>
                  </div>

                  <!-- Center: Play Button -->
                  <div class="reel-center-play">
                    <div class="play-btn-ring">
                      <div class="play-btn-inner">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 4 20 12 6 20 6 4"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom: Info Overlay -->
                  <div class="reel-info-overlay">
                    <div class="reel-category-tag">{{ reel.name }}</div>
                    <h4 class="reel-card-title">{{ reel.title }}</h4>
                    
                  </div>

                  <!-- Hover Shine Effect -->
                  <div class="reel-shine"></div>
                </div>
              }
            </div>

            <!-- Right Nav Button -->
            <button class="reel-scroll-btn reel-scroll-right" (click)="scrollReelsRight()" aria-label="Scroll Right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <!-- Scroll Progress Dots -->
          <div class="reels-progress-dots">
            @for (reel of reelsList; track reel.id; let i = $index) {
              <span class="reel-dot" [class.active]="activeReelDot() === i"></span>
            }
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

                <!-- IMAGE SECTION -->
                <a [routerLink]="['/product', product.id]" class="pcard-img-link">
                  <div class="pcard-img-wrap">
                    <img [src]="product.image" [alt]="product.name" class="pcard-img main-img" loading="lazy">
                    @if (product.secondaryImage && product.secondaryImage !== product.image) {
                      <img [src]="product.secondaryImage" [alt]="product.name" class="pcard-img hover-img" loading="lazy">
                    }
                    <div class="img-hover-tint"></div>
                  </div>

                  <!-- Badges on image -->
                  <div class="pcard-badge-group">
                    @if (product.isBestseller) {
                      <span class="badge-bestseller">★ BESTSELLER</span>
                    }
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="badge-discount">{{ getDiscountPercent(product.price, product.originalPrice) }}% OFF</span>
                    }
                  </div>
                </a>

                <!-- INFO SECTION -->
                <div class="pcard-info">
                  <div class="pcard-rating">
                    <span class="star">★</span>
                    <span class="rating-val">{{ product.rating }}</span>
                    <span class="rating-count">({{ product.ratingCount }})</span>
                  </div>

                  <a [routerLink]="['/product', product.id]" class="pcard-title-link">
                    <h3 class="pcard-title">{{ product.name }}</h3>
                  </a>

                  <div class="pcard-bottom-row">
                    <div class="pcard-price-col">
                      <span class="price-current">₹{{ product.price }}</span>
                      @if (product.originalPrice && product.originalPrice > product.price) {
                        <span class="price-original">₹{{ product.originalPrice }}</span>
                      }
                    </div>
                    <button class="pcard-add-btn" (click)="addToCart(product)" aria-label="Add to Cart">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <span>Add</span>
                    </button>
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

          <div class="why-slider-container">
            <div class="why-track" #whyTrack (scroll)="onWhyScroll(whyTrack)">
              <div class="why-card" id="why-slide-0">
                <div class="why-icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 class="why-card-title">Executive Grade Quality</h3>
                <p class="why-card-desc">High-density 240+ GSM cotton fabrics, stainless steel flasks &amp; precision German laser branding.</p>
              </div>
              <div class="why-card" id="why-slide-1">
                <div class="why-icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                </div>
                <h3 class="why-card-title">In-House Customization</h3>
                <p class="why-card-desc">Laser engraving, multi-color UV printing, digital embroidery &amp; custom debossing directly at our facility.</p>
              </div>
              <div class="why-card" id="why-slide-2">
                <div class="why-icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </div>
                <h3 class="why-card-title">Direct Factory Pricing</h3>
                <p class="why-card-desc">No middle-men markup. Get tiered corporate discounts, GST tax invoicing &amp; flexible payment terms.</p>
              </div>
              <div class="why-card" id="why-slide-3">
                <div class="why-icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <h3 class="why-card-title">Pan-India Express Dispatch</h3>
                <p class="why-card-desc">Reliable courier network delivering to 19,000+ pin codes with live consignment tracking.</p>
              </div>
            </div>

            <!-- WHY CHOOSE SLIDER INDICATORS -->
            <div class="why-indicators">
              @for (item of [0, 1, 2, 3]; track item) {
                <button class="why-dot" [class.active]="currentWhyIndex() === item" (click)="setWhyIndex(item)" [attr.aria-label]="'Go to advantage ' + (item + 1)"></button>
              }
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

          <div class="reviews-slider-container">
            <div class="reviews-track" #reviewsTrack (scroll)="onReviewsScroll(reviewsTrack)">
              @for (rev of customerReviews; track rev.name; let i = $index) {
                <div class="review-slide" [id]="'review-slide-' + i">
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
                </div>
              }
            </div>

            <!-- REVIEWS SLIDER INDICATORS & CONTROLS -->
            <div class="reviews-controls">
              <button class="rev-nav-btn prev" (click)="prevReviewSlide()" aria-label="Previous Review">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div class="reviews-indicators">
                @for (rev of customerReviews; track rev.name; let i = $index) {
                  <button class="rev-dot" [class.active]="currentReviewIndex() === i" (click)="setReviewIndex(i)" [attr.aria-label]="'Go to review ' + (i + 1)"></button>
                }
              </div>
              <button class="rev-nav-btn next" (click)="nextReviewSlide()" aria-label="Next Review">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>




      <!-- INSTAGRAM-STYLE REEL VIEWER -->
      @if (instaReelOpen()) {
        <div class="insta-reel-backdrop" (click)="closeInstaReel()">
          <div class="insta-reel-viewer" (click)="$event.stopPropagation()">

            <!-- Close Button -->
            <button class="ir-close-btn" (click)="closeInstaReel()" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <!-- Reel Counter (e.g. 2 / 5) -->
            <div class="ir-counter">{{ instaReelIndex() + 1 }} / {{ reelsList.length }}</div>

            <!-- Progress Bar Strip -->
            <div class="ir-progress-strip">
              @for (reel of reelsList; track reel.id; let i = $index) {
                <div class="ir-progress-seg" [class.active]="i === instaReelIndex()" [class.done]="i < instaReelIndex()"></div>
              }
            </div>

            <!-- Video Area -->
            <div class="ir-video-wrap">
              <video
                [src]="reelsList[instaReelIndex()].videoUrl"
                autoplay
                playsinline
                [muted]="instaReelMuted()"
                class="ir-video"
                (ended)="nextInstaReel()"
              ></video>

              <!-- Gradient overlays -->
              <div class="ir-overlay-top"></div>
              <div class="ir-overlay-bottom"></div>
            </div>

            <!-- Bottom Info Bar -->
            <div class="ir-bottom-info">
              <div class="ir-live-badge">
                <span class="ir-live-dot"></span> LIVE FACTORY
              </div>
              <h3 class="ir-reel-title">{{ reelsList[instaReelIndex()].title }}</h3>
              <p class="ir-reel-tag">{{ reelsList[instaReelIndex()].name }}</p>
            </div>

            <!-- Right Side Actions -->
            <div class="ir-side-actions">
              <!-- Mute Toggle -->
              <button class="ir-action-btn" (click)="toggleInstaReelMute()" [attr.aria-label]="instaReelMuted() ? 'Unmute' : 'Mute'">
                @if (instaReelMuted()) {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                } @else {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                }
              </button>
            </div>

            <!-- Up / Down Navigation -->
            <button class="ir-nav-btn ir-nav-up" (click)="prevInstaReel()" [disabled]="instaReelIndex() === 0" aria-label="Previous Reel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button class="ir-nav-btn ir-nav-down" (click)="nextInstaReel()" [disabled]="instaReelIndex() === reelsList.length - 1" aria-label="Next Reel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

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
        margin: 8px 10px 18px;
        border-radius: var(--radius-lg);
        height: 380px;
        width: calc(100% - 20px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
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
        object-position: center 38%;
      }
    }

    .hero-slide:hover .hero-bg-img {
      transform: scale(1.06);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        0deg,
        rgba(10, 12, 18, 0.94) 0%,
        rgba(10, 12, 18, 0.72) 28%,
        rgba(10, 12, 18, 0.25) 55%,
        rgba(10, 12, 18, 0.0) 80%
      );

      @media (max-width: 768px) {
        background: linear-gradient(
          0deg,
          rgba(10, 12, 18, 0.95) 0%,
          rgba(10, 12, 18, 0.75) 45%,
          rgba(10, 12, 18, 0.15) 75%,
          rgba(10, 12, 18, 0.0) 100%
        );
      }
    }

    .hero-content-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end; /* ALIGNED TO BOTTOM ON BOTH WEB & MOBILE */
      padding: 0 48px 56px;

      @media (max-width: 768px) {
        padding: 0 16px 26px;
      }
    }

    .hero-text-block {
      max-width: 700px;
      color: #ffffff;
      padding: 0;
      z-index: 2;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .hero-main-title {
      font-size: clamp(24px, 3.8vw, 48px);
      font-weight: 800;
      line-height: 1.18;
      color: #ffffff;
      letter-spacing: -0.025em;
      margin-bottom: 22px;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);

      @media (max-width: 768px) {
        font-size: 20px;
        line-height: 1.25;
        margin-bottom: 14px;
        letter-spacing: -0.01em;
      }
    }

    .hero-btn-row {
      display: flex;
      gap: 14px;

      .hero-btn-main {
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        color: #111111;
        font-weight: 700;
        font-size: 15px;
        border: none;
        padding: 13px 28px;
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

      @media (max-width: 768px) {
        .hero-btn-main {
          padding: 10px 18px;
          font-size: 12.5px;
          font-weight: 700;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

      @media (max-width: 768px) {
        bottom: 10px;
        gap: 6px;
      }

      .indicator-dot {
        width: 32px;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.35);
        border: none;
        cursor: pointer;
        padding: 0;
        transition: all 0.3s;

        @media (max-width: 768px) {
          width: 20px;
          height: 3px;
        }

        &.active {
          background: #f59e0b;
          width: 52px;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);

          @media (max-width: 768px) {
            width: 32px;
          }
        }
      }
    }

    /* ── 2. INSIDE GIFTAURA (Reels) ── */
    .inside-gl-section {
      background: #fbfaf8;
      border-top: 1px solid #eee8db;
      border-bottom: 1px solid #eee8db;
      padding: 50px 0;
    }

    /* Background orbs */
    .reels-bg-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    /* Background orbs — hidden on light bg */
    .bg-orb { display: none; }

    /* Section Header */
    .reels-header {
      position: relative;
      z-index: 1;
      margin-bottom: 44px;

      @media (max-width: 768px) {
        margin-bottom: 32px;
      }
    }

    .reels-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #d4af37;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 18px;

      .pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #d4af37;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
        animation: pulse 1.8s infinite;
      }
    }

    .reels-main-title {
      font-size: clamp(26px, 3.5vw, 44px);
      font-weight: 800;
      color: #111111;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 14px;

      .title-highlight {
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .reels-subtitle {
      font-size: 15px;
      color: #6b7280;
      max-width: 520px;
      margin: 0 auto;
      line-height: 1.65;

      @media (max-width: 768px) {
        font-size: 13.5px;
      }
    }

    /* Scroll Wrapper */
    .reels-scroll-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 12px;

      @media (max-width: 768px) {
        gap: 0;
      }
    }

    /* Scroll Nav Buttons */
    .reel-scroll-btn {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(8px);
      z-index: 5;

      &:hover {
        background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
        border-color: #d4af37;
        color: #111;
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(212, 175, 55, 0.45);
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    /* Reels Horizontal Track */
    .reels-track {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      padding: 12px 4px 20px;
      scrollbar-width: none;
      flex: 1;

      &::-webkit-scrollbar {
        display: none;
      }

      @media (min-width: 1024px) {
        gap: 20px;
        padding: 16px 6px 24px;
      }
    }

    /* Individual Reel Card V2 */
    .reel-card-v2 {
      flex: 0 0 calc(72% - 8px);
      scroll-snap-align: start;
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 9 / 15;
      background: #0f1118;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);

      @media (min-width: 480px) {
        flex: 0 0 calc(50% - 8px);
      }

      @media (min-width: 768px) {
        flex: 0 0 calc(33.333% - 14px);
      }

      @media (min-width: 1024px) {
        flex: 0 0 calc(20% - 16px);
      }

      &:hover {
        transform: translateY(-10px) scale(1.025);
        border-color: rgba(212, 175, 55, 0.5);
        box-shadow:
          0 24px 60px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(212, 175, 55, 0.3),
          0 0 40px rgba(212, 175, 55, 0.12);

        .reel-video-bg {
          transform: scale(1.08);
        }

        .play-btn-ring {
          transform: scale(1.12);
          border-color: rgba(212, 175, 55, 0.9);
          box-shadow: 0 0 0 8px rgba(212, 175, 55, 0.15);
        }

        .play-btn-inner {
          background: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
          color: #111;
        }

        .reel-watch-cta {
          letter-spacing: 0.5px;
        }

        .reel-shine {
          opacity: 1;
        }

        .reel-info-overlay {
          padding-bottom: 20px;
        }
      }
    }

    /* Video Background */
    .reel-media-wrap {
      position: absolute;
      inset: 0;
      z-index: 1;

      .reel-video-bg {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .reel-gradient-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 45%;
      background: linear-gradient(180deg, rgba(5, 7, 12, 0.75) 0%, transparent 100%);
      z-index: 2;
    }

    .reel-gradient-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 65%;
      background: linear-gradient(0deg, rgba(5, 7, 12, 0.98) 0%, rgba(5, 7, 12, 0.6) 50%, transparent 100%);
      z-index: 2;
    }

    /* Top Header Bar */
    .reel-header-bar {
      position: absolute;
      top: 14px;
      left: 14px;
      right: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 5;
    }

    .reel-live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(10, 12, 18, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 100px;
      padding: 4px 10px 4px 8px;

      .live-pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 10px #ef4444;
        animation: liveGlow 1.5s ease-in-out infinite alternate;
      }

      .live-text {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1px;
        color: #ff6b6b;
        text-transform: uppercase;
      }
    }

    .reel-index-num {
      font-size: 11px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 0.5px;
    }

    /* Center Play Button */
    .reel-center-play {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
      pointer-events: none;
    }

    .play-btn-ring {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(4px);
      background: rgba(0, 0, 0, 0.2);
    }

    .play-btn-inner {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #111111;
      padding-left: 2px;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }

    /* Bottom Info Overlay */
    .reel-info-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0 14px 16px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: padding-bottom 0.3s ease;
    }

    .reel-category-tag {
      font-size: 10.5px;
      font-weight: 700;
      color: #fbbf24;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    }

    .reel-card-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .reel-cta-row {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      color: rgba(255, 255, 255, 0.65);

      svg {
        transition: transform 0.25s ease;
      }

      .reel-watch-cta {
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0;
        transition: letter-spacing 0.3s ease;
      }
    }

    .reel-card-v2:hover .reel-cta-row svg {
      transform: translateX(4px);
    }

    /* Shine Hover Effect */
    .reel-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(212, 175, 55, 0.06) 0%,
        transparent 50%,
        rgba(212, 175, 55, 0.03) 100%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 3;
      pointer-events: none;
    }

    /* Progress Dots */
    .reels-progress-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      position: relative;
      z-index: 1;

      .reel-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;

        &.active {
          width: 24px;
          border-radius: 3px;
          background: linear-gradient(90deg, #d4af37, #f59e0b);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
        }
      }
    }

    /* Live glow animation */
    @keyframes liveGlow {
      from { opacity: 1; box-shadow: 0 0 6px #ef4444; }
      to   { opacity: 0.5; box-shadow: 0 0 14px #ef4444; }
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

    /* ── PRODUCT CARD (Home) ── */
    .gl-product-card {
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

        .pcard-img.main-img  { transform: scale(1.07); }
        .pcard-img.hover-img { opacity: 1; }
        .img-hover-tint      { opacity: 1; }
      }
    }

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

    /* Badges */
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

      @media (max-width: 480px) { top: 7px; left: 7px; right: 7px; }
    }

    .badge-bestseller {
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

      @media (max-width: 480px) { font-size: 8px; padding: 3px 6px; }
    }

    .badge-discount {
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

      @media (max-width: 480px) { font-size: 8px; padding: 3px 6px; }
    }

    /* Info */
    .pcard-info {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(235, 229, 216, 0.55);

      @media (max-width: 480px) { padding: 10px 11px 12px; gap: 4px; }
    }

    .pcard-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;

      .star         { color: #f59e0b; font-size: 13px; }
      .rating-val   { font-weight: 700; color: #111; }
      .rating-count { color: #9ca3af; font-size: 10.5px; }
    }

    .pcard-title-link { text-decoration: none; }

    .pcard-title {
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

      @media (max-width: 480px) { font-size: 12.5px; min-height: 33px; }

      &:hover { color: #d4af37; }
    }

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

      .price-current {
        font-size: 16px;
        font-weight: 900;
        color: #11141c;
        letter-spacing: -0.02em;
        line-height: 1;

        @media (max-width: 480px) { font-size: 14px; }
      }

      .price-original {
        font-size: 11px;
        color: #a1a1aa;
        text-decoration: line-through;
        line-height: 1;
      }
    }

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

      @media (max-width: 480px) { padding: 7px 10px; font-size: 11px; }

      &:hover {
        background: linear-gradient(135deg, #b8922d 0%, #e08e00 100%);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
        transform: translateY(-1px);
      }
      &:active { transform: scale(0.92); }
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

      @media (max-width: 767px) {
        padding: 40px 0 32px;
      }
    }

    .why-slider-container {
      position: relative;
      margin-top: 32px;

      @media (max-width: 767px) {
        margin-top: 24px;
      }
    }

    .why-track {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;

      @media (max-width: 1023px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }

      @media (max-width: 767px) {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        gap: 14px;
        padding: 8px 16px 16px;
        margin: 0 -16px;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
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

      @media (max-width: 767px) {
        flex: 0 0 78%;
        min-width: 78%;
        scroll-snap-align: center;
        padding: 28px 20px;
        border-radius: 18px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
      }

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
        transform: translateY(-4px);
        box-shadow: 0 16px 36px rgba(27, 33, 59, 0.09);
        border-color: #d4af37;

        &::before {
          background: linear-gradient(90deg, #d4af37, #f59e0b);
        }

        .why-icon-box {
          transform: scale(1.08);
          background: #fde68a;
        }
      }

      .why-icon-box {
        width: 58px;
        height: 58px;
        border-radius: 16px;
        background: #fef3c7;
        border: 1px solid #fde68a;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
        transition: all 0.3s ease;

        svg {
          width: 26px;
          height: 26px;
        }

        @media (max-width: 767px) {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          margin-bottom: 16px;

          svg {
            width: 24px;
            height: 24px;
          }
        }
      }

      .why-card-title {
        font-size: 16px;
        font-weight: 800;
        color: #11141c;
        margin-bottom: 10px;
        letter-spacing: -0.01em;

        @media (max-width: 767px) {
          font-size: 15px;
          margin-bottom: 8px;
        }
      }

      .why-card-desc {
        font-size: 13.5px;
        color: #52525b;
        line-height: 1.6;

        @media (max-width: 767px) {
          font-size: 12.5px;
          line-height: 1.5;
        }
      }
    }

    .why-indicators {
      display: none;

      @media (max-width: 767px) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 14px;

        .why-dot {
          width: 7px;
          height: 7px;
          border-radius: var(--radius-full);
          background: #d1d5db;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;

          &.active {
            width: 22px;
            background: #d4af37;
          }
        }
      }
    }

    /* ── 8. REVIEWS SLIDER ── */
    .reviews-section {
      background: #fbfaf8;
      border-top: 1px solid #eee8db;
      padding: 60px 0;

      @media (max-width: 767px) {
        padding: 40px 0 46px;
      }
    }

    .reviews-slider-container {
      position: relative;
      margin-top: 28px;

      @media (min-width: 768px) {
        margin-top: 36px;
      }
    }

    .reviews-track {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      padding: 8px 4px 16px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      @media (min-width: 1024px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        overflow-x: visible;
        padding: 10px 0;
      }
    }

    .review-slide {
      flex: 0 0 88%;
      min-width: 88%;
      scroll-snap-align: center;

      @media (min-width: 640px) {
        flex: 0 0 70%;
        min-width: 70%;
      }

      @media (min-width: 1024px) {
        flex: auto;
        min-width: 0;
      }
    }

    .review-card {
      background: #ffffff;
      border: 1px solid #ebe5d8;
      border-radius: 18px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
      height: 100%;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      @media (min-width: 768px) {
        padding: 32px 28px;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        border-color: #d4af37;
      }

      .rev-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
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
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-full);
      }

      .rev-card-title {
        font-size: 15px;
        font-weight: 800;
        color: #11141c;
        margin-bottom: 8px;
        line-height: 1.35;
      }

      .rev-body {
        font-size: 13px;
        color: #52525b;
        line-height: 1.6;
        margin-bottom: 20px;
        flex: 1;
      }

      .rev-author-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: auto;
        padding-top: 14px;
        border-top: 1px solid #f4f1ea;

        .rev-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #11141c 0%, #2a2c36 100%);
          color: #fbbf24;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .rev-details {
          display: flex;
          flex-direction: column;

          .rev-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #11141c;
          }

          .rev-company {
            font-size: 11.5px;
            color: #71717a;
            margin-top: 1px;
          }
        }
      }
    }

    .reviews-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 18px;

      @media (min-width: 1024px) {
        display: none;
      }
    }

    .rev-nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e5e0d4;
      color: #11141c;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:hover {
        background: #11141c;
        color: #fbbf24;
        border-color: #11141c;
      }

      &:active {
        transform: scale(0.92);
      }
    }

    .reviews-indicators {
      display: flex;
      align-items: center;
      gap: 8px;

      .rev-dot {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        background: #d1d5db;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: all 0.25s ease;

        &.active {
          width: 24px;
          background: #d4af37;
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

    /* ── INSTAGRAM-STYLE REEL VIEWER ── */
    .insta-reel-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(16px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: irFadeIn 0.2s ease forwards;

      @keyframes irFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    }

    .insta-reel-viewer {
      position: relative;
      width: 100%;
      max-width: 390px;
      height: 100dvh;
      max-height: 844px;
      background: #000;
      border-radius: 0;
      overflow: hidden;
      animation: irSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;

      @media (min-width: 600px) {
        border-radius: 20px;
        height: 90dvh;
        max-height: 820px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
      }

      @keyframes irSlideUp {
        from { transform: translateY(40px) scale(0.97); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
    }

    /* Close button */
    .ir-close-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;
      transition: background 0.2s, transform 0.2s;

      &:hover {
        background: rgba(239, 68, 68, 0.75);
        transform: scale(1.1);
      }
    }

    /* Counter */
    .ir-counter {
      position: absolute;
      top: 22px;
      right: 16px;
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.5px;
      z-index: 20;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(6px);
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Progress strip (like Instagram Stories) */
    .ir-progress-strip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      gap: 4px;
      padding: 10px 12px 0;
      z-index: 20;

      .ir-progress-seg {
        flex: 1;
        height: 2.5px;
        border-radius: 2px;
        background: rgba(255,255,255,0.3);
        transition: background 0.3s ease;

        &.done {
          background: rgba(255,255,255,0.85);
        }

        &.active {
          background: #ffffff;
          box-shadow: 0 0 6px rgba(255,255,255,0.5);
        }
      }
    }

    /* Video */
    .ir-video-wrap {
      position: absolute;
      inset: 0;
      z-index: 1;

      .ir-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    /* Gradient overlays */
    .ir-overlay-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 35%;
      background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
      z-index: 2;
      pointer-events: none;
    }

    .ir-overlay-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
      z-index: 2;
      pointer-events: none;
    }

    /* Bottom Info */
    .ir-bottom-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 70px;
      padding: 0 18px 28px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ir-live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(10,12,18,0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(239,68,68,0.4);
      border-radius: 100px;
      padding: 3px 10px 3px 8px;
      width: fit-content;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #ff6b6b;
      margin-bottom: 4px;

      .ir-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 8px #ef4444;
        animation: liveGlow 1.4s ease-in-out infinite alternate;
      }
    }

    .ir-reel-title {
      font-size: 17px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
      text-shadow: 0 2px 10px rgba(0,0,0,0.7);
    }

    .ir-reel-tag {
      font-size: 13px;
      font-weight: 600;
      color: #fbbf24;
      margin: 0;
      text-shadow: 0 1px 6px rgba(0,0,0,0.6);
    }

    /* Side action buttons */
    .ir-side-actions {
      position: absolute;
      bottom: 80px;
      right: 14px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }

    .ir-action-btn {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        background: rgba(255,255,255,0.25);
        transform: scale(1.1);
      }
    }

    /* Up/Down Nav Buttons */
    .ir-nav-btn {
      position: absolute;
      right: 14px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover:not(:disabled) {
        background: rgba(212, 175, 55, 0.4);
        border-color: rgba(212, 175, 55, 0.6);
        color: #fbbf24;
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }

      &.ir-nav-up {
        bottom: 188px;
      }

      &.ir-nav-down {
        bottom: 134px;
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
  readonly activeReelDot = signal<number>(0);
  readonly instaReelOpen = signal<boolean>(false);
  readonly instaReelIndex = signal<number>(0);
  readonly instaReelMuted = signal<boolean>(false);

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
      title: 'Custom Polo T-Shirts with Company Logo',
      subtitle: '',
      badge: '',
      btnText: 'Shop T-Shirts',
      btnLink: '/menu',
      queryParams: { cat: 't-shirts' },
      image: '/assets/images/hero/hero-polo-tshirts.jpg'
    },
    {
      id: 2,
      title: 'Premium Corporate Gifts & Executive Welcome Kits',
      subtitle: '',
      badge: '',
      btnText: 'Explore Welcome Kits',
      btnLink: '/menu',
      queryParams: { cat: 'welcome-kits' },
      image: '/assets/images/hero/hero-welcome-kits.jpg'
    },
    {
      id: 3,
      title: 'Laser Engraved Metal Pens, Keychains & Badges',
      subtitle: '',
      badge: '',
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

  currentReviewIndex = signal(0);

  setReviewIndex(index: number) {
    this.currentReviewIndex.set(index);
    const el = this.document.getElementById('review-slide-' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  nextReviewSlide() {
    const next = (this.currentReviewIndex() + 1) % this.customerReviews.length;
    this.setReviewIndex(next);
  }

  prevReviewSlide() {
    const prev = (this.currentReviewIndex() - 1 + this.customerReviews.length) % this.customerReviews.length;
    this.setReviewIndex(prev);
  }

  onReviewsScroll(el: HTMLElement) {
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / (width * 0.85));
      if (idx >= 0 && idx < this.customerReviews.length && idx !== this.currentReviewIndex()) {
        this.currentReviewIndex.set(idx);
      }
    }
  }

  currentWhyIndex = signal(0);

  setWhyIndex(index: number) {
    this.currentWhyIndex.set(index);
    const el = this.document.getElementById('why-slide-' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  onWhyScroll(el: HTMLElement) {
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / (width * 0.78));
      if (idx >= 0 && idx < 4 && idx !== this.currentWhyIndex()) {
        this.currentWhyIndex.set(idx);
      }
    }
  }

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
    const index = this.reelsList.findIndex(r => r.id === reel.id);
    this.instaReelIndex.set(index >= 0 ? index : 0);
    this.instaReelMuted.set(false);
    this.instaReelOpen.set(true);
    // Keep old signal for backward compat
    this.activeVideoReel.set(reel);
  }

  closeVideoModal() {
    this.activeVideoReel.set(null);
  }

  closeInstaReel() {
    this.instaReelOpen.set(false);
    this.activeVideoReel.set(null);
  }

  nextInstaReel() {
    const next = this.instaReelIndex() + 1;
    if (next < this.reelsList.length) {
      this.instaReelIndex.set(next);
    } else {
      this.closeInstaReel();
    }
  }

  prevInstaReel() {
    const prev = this.instaReelIndex() - 1;
    if (prev >= 0) {
      this.instaReelIndex.set(prev);
    }
  }

  toggleInstaReelMute() {
    this.instaReelMuted.set(!this.instaReelMuted());
  }

  scrollReelsLeft() {
    const track = this.document.querySelector('.reels-track') as HTMLElement;
    if (track) {
      const cardWidth = (track.firstElementChild as HTMLElement)?.offsetWidth || 200;
      track.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
      const newIndex = Math.max(0, this.activeReelDot() - 1);
      this.activeReelDot.set(newIndex);
    }
  }

  scrollReelsRight() {
    const track = this.document.querySelector('.reels-track') as HTMLElement;
    if (track) {
      const cardWidth = (track.firstElementChild as HTMLElement)?.offsetWidth || 200;
      track.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
      const newIndex = Math.min(this.reelsList.length - 1, this.activeReelDot() + 1);
      this.activeReelDot.set(newIndex);
    }
  }

  submitInquiry(e: Event) {
    e.preventDefault();
    this.inquirySubmitted.set(true);

    // Pre-fill WhatsApp message
    const msg = `*New Bulk Inquiry from Website*%0A*Name:* ${this.inquiryForm.name}%0A*Company:* ${this.inquiryForm.company}%0A*Phone:* ${this.inquiryForm.phone}%0A*Product:* ${this.inquiryForm.product}%0A*Quantity:* ${this.inquiryForm.quantity}%0A*Message:* ${this.inquiryForm.message || 'None'}`;
    window.open(`https://wa.me/918461909143?text=${msg}`, '_blank');
  }
}
