import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, DOCUMENT, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

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
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
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
            <h2 class="gl-section-title">Trending Corporate Gifts</h2>
            <p class="gl-section-subtitle">Laser engraved executive pens, customized keychains, mobile stands &amp; premium welcome gift sets.</p>
          </div>

          <!-- CATEGORY CARDS FILTER -->
          <div class="gl-filter-tabs">
            <button class="filter-tab" [class.active]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"></polyline>
                  <rect x="2" y="7" width="20" height="5" rx="1"></rect>
                  <line x1="12" y1="22" x2="12" y2="7"></line>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                </svg>
              </span>
              <span class="cat-label">All Products</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 'corporate-gifts'" (click)="selectedCategory.set('corporate-gifts')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <path d="M14 7l3-3 2 2-3 3"></path>
                  <line x1="10" y1="11" x2="16" y2="11"></line>
                  <line x1="10" y1="15" x2="14" y2="15"></line>
                </svg>
              </span>
              <span class="cat-label">Pens & Diaries</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 'welcome-kits'" (click)="selectedCategory.set('welcome-kits')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              <span class="cat-label">Welcome Kits</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 't-shirts'" (click)="selectedCategory.set('t-shirts')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
                </svg>
              </span>
              <span class="cat-label">Customized T-Shirts</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 'keychains-badges'" (click)="selectedCategory.set('keychains-badges')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8.5" r="5.5"></circle>
                  <path d="M9 13.5L7 22l5-2.5L17 22l-2-8.5"></path>
                </svg>
              </span>
              <span class="cat-label">Keychains & Badges</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 'office-essentials'" (click)="selectedCategory.set('office-essentials')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                  <line x1="12" y1="12" x2="12" y2="12.01"></line>
                  <path d="M2 13h20"></path>
                </svg>
              </span>
              <span class="cat-label">Office Essentials</span>
            </button>

            <button class="filter-tab" [class.active]="selectedCategory() === 'drinkware'" (click)="selectedCategory.set('drinkware')">
              <span class="cat-icon-wrap">
                <svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 2h6v2H9z"></path>
                  <path d="M8 4h8v3H8z"></path>
                  <rect x="7" y="7" width="10" height="15" rx="3"></rect>
                  <line x1="7" y1="12" x2="17" y2="12"></line>
                </svg>
              </span>
              <span class="cat-label">Vacuum Flasks</span>
            </button>
          </div>

          <!-- PRODUCTS GRID -->
          <div class="gl-products-grid">
            @for (product of filteredProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
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
        </div>
      </section>

      <!-- 7. WHY CHOOSE GIFTAURA -->
      <section class="gl-section why-choose-section" id="why-choose">
        <div class="container">
          <div class="why-choose-card">
            <!-- Decorative Leaf Accents (Desktop only) -->
            <svg class="why-leaf-accent why-leaf-left" width="110" height="110" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M10 90 C 25 60, 50 40, 85 20" stroke="#d4c5a9" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M26 74 C 14 62, 18 46, 33 56 C 36 65, 26 74, 26 74 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M44 57 C 39 40, 55 42, 49 55 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M62 40 C 56 25, 72 26, 68 39 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M80 24 C 76 12, 90 10, 87 23 Z" fill="#d4c5a9" opacity="0.35"/>
            </svg>
            <svg class="why-leaf-accent why-leaf-right" width="110" height="110" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M90 90 C 75 60, 50 40, 15 20" stroke="#d4c5a9" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M74 74 C 86 62, 82 46, 67 56 C 64 65, 74 74, 74 74 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M56 57 C 61 40, 45 42, 51 55 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M38 40 C 44 25, 28 26, 32 39 Z" fill="#d4c5a9" opacity="0.35"/>
              <path d="M20 24 C 24 12, 10 10, 13 23 Z" fill="#d4c5a9" opacity="0.35"/>
            </svg>

            <!-- Header -->
            <div class="why-choose-header">
              <span class="why-eyebrow">WHY CHOOSE GIFTAURA</span>
              <h2 class="why-title">Your Trusted Corporate Gifting Partner</h2>
            </div>

            <!-- 4 Features Strip (Grid on Desktop, Swipe Slider on Mobile) -->
            <div class="why-features-grid" #whySlider (scroll)="onWhyScroll(whySlider)">
              <!-- Feature 1 -->
              <div class="why-feature-col">
                <div class="why-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <h3 class="why-feature-title">Premium Quality</h3>
                <p class="why-feature-desc">Carefully curated products for lasting value</p>
              </div>

              <!-- Feature 2 -->
              <div class="why-feature-col">
                <div class="why-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                  </svg>
                </div>
                <h3 class="why-feature-title">Custom Branding</h3>
                <p class="why-feature-desc">Make your brand truly memorable</p>
              </div>

              <!-- Feature 3 -->
              <div class="why-feature-col">
                <div class="why-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <h3 class="why-feature-title">Pan India Delivery</h3>
                <p class="why-feature-desc">On-time &amp; secure delivery across India</p>
              </div>

              <!-- Feature 4 -->
              <div class="why-feature-col">
                <div class="why-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3 class="why-feature-title">Dedicated Support</h3>
                <p class="why-feature-desc">Our team is always here to help</p>
              </div>
            </div>

            <!-- Mobile Dots Pagination -->
            <div class="why-mobile-dots">
              <button type="button" class="why-dot" [class.active]="activeWhySlide() === 0" (click)="scrollToWhySlide(0, whySlider)" aria-label="Feature 1"></button>
              <button type="button" class="why-dot" [class.active]="activeWhySlide() === 1" (click)="scrollToWhySlide(1, whySlider)" aria-label="Feature 2"></button>
              <button type="button" class="why-dot" [class.active]="activeWhySlide() === 2" (click)="scrollToWhySlide(2, whySlider)" aria-label="Feature 3"></button>
              <button type="button" class="why-dot" [class.active]="activeWhySlide() === 3" (click)="scrollToWhySlide(3, whySlider)" aria-label="Feature 4"></button>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. REVIEWS & TESTIMONIALS (AUTO SLIDER) -->
      <section class="gl-section reviews-section"
               (mouseenter)="pauseReviewAutoplay()"
               (mouseleave)="resumeReviewAutoplay()"
               (touchstart)="pauseReviewAutoplay()"
               (touchend)="resumeReviewAutoplay()">
        <div class="container">
          <div class="rev-header">
            <div class="rev-eyebrow-wrap">
              <span class="rev-eyebrow-line"></span>
              <span class="rev-eyebrow">WHAT OUR CLIENTS SAY</span>
              <span class="rev-eyebrow-line"></span>
            </div>
            <h2 class="rev-title">Trusted by Leading Brands</h2>
            <p class="rev-subtitle">Real stories. Lasting partnerships.</p>
          </div>

          <div class="reviews-slider-container">
            <!-- Floating Side Navigation Arrows for Desktop/Tablet -->
            <button class="rev-side-arrow prev" (click)="manualPrevReview()" aria-label="Previous Review">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="rev-side-arrow next" (click)="manualNextReview()" aria-label="Next Review">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div class="reviews-track" id="reviews-track" #reviewsTrack (scroll)="onReviewsScroll(reviewsTrack)">
              @for (rev of customerReviews; track rev.name; let i = $index) {
                <div class="review-slide" [id]="'review-slide-' + i">
                  <div class="review-card">
                    <!-- Top Gold Quote Icon -->
                    <div class="rev-quote-badge">
                      <svg width="22" height="18" viewBox="0 0 24 20" fill="currentColor">
                        <path d="M0 11.5C0 5.1 4.2 1 9.2 0l1.3 2.5C6.9 3.6 5.4 5.9 5 8.3h4.9V20H0V11.5zm12.5 0c0-6.4 4.2-10.5 9.2-11.5l1.3 2.5c-3.6 1.1-5.1 3.4-5.5 5.8h4.9V20h-9.9V11.5z"/>
                      </svg>
                    </div>

                    <!-- Review Text / Italic Quote -->
                    <p class="rev-comment">"{{ rev.comment }}"</p>

                    <!-- Author Details Row -->
                    <div class="rev-author-footer">
                      <div class="rev-avatar-box">
                        @if (rev.avatar) {
                          <img [src]="rev.avatar" [alt]="rev.name" class="rev-avatar-img" (error)="rev.avatar = ''" loading="lazy">
                        } @else {
                          <div class="rev-avatar-fallback">{{ rev.name[0] }}</div>
                        }
                      </div>
                      <div class="rev-author-details">
                        <div class="rev-author-name">{{ rev.name }}</div>
                        <div class="rev-author-role">{{ rev.role }}, {{ rev.company }}</div>
                        <div class="rev-stars">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Bottom Pagination Dots & Mobile Nav -->
            <div class="reviews-bottom-bar">
              <button class="rev-nav-btn mobile-only prev" (click)="manualPrevReview()" aria-label="Previous Review">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div class="reviews-indicators">
                @for (rev of customerReviews; track rev.name; let i = $index) {
                  <button class="rev-dot" [class.active]="currentReviewIndex() === i" (click)="manualSetReview(i)" [attr.aria-label]="'Go to review ' + (i + 1)"></button>
                }
              </div>

              <button class="rev-nav-btn mobile-only next" (click)="manualNextReview()" aria-label="Next Review">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      gap: 12px;
      justify-content: center;
      align-items: stretch;
      margin: 0 auto 36px;
      max-width: 1200px;
      padding: 4px 8px;

      @media (max-width: 1024px) {
        justify-content: flex-start;
        overflow-x: auto;
        padding: 4px 16px 14px;
        margin: 0 -16px 28px;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .filter-tab {
        flex: 1 1 auto;
        min-width: max-content;
        min-height: 94px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 18px 12px;
        background: #ffffff;
        color: #4b5563;
        border: 1px solid #e5e0d4;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
        white-space: nowrap;

        @media (max-width: 1024px) {
          flex: 0 0 auto;
          scroll-snap-align: start;
          padding: 12px 16px 10px;
          min-height: 90px;
        }

        .cat-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          color: currentColor;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

          .cat-icon {
            width: 24px;
            height: 24px;
            display: block;
          }
        }

        .cat-label {
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.2;
          color: inherit;
          white-space: nowrap;

          @media (max-width: 1024px) {
            font-size: 12.5px;
          }
        }

        &:hover {
          background: #ffffff;
          border-color: #d4af37;
          color: #111111;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);

          .cat-icon-wrap {
            transform: scale(1.08);
            color: #d4af37;
          }
        }

        &.active {
          background: #11141c;
          color: #fbbf24;
          border-color: #11141c;
          font-weight: 700;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(17, 20, 28, 0.2);

          .cat-label {
            color: #fbbf24;
          }

          .cat-icon-wrap {
            color: #fbbf24;
          }

          &:hover {
            background: #1a1e29;
            transform: translateY(-2px);
          }
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

    .view-all-row {
      text-align: center;
      margin-top: 24px;
      margin-bottom: 4px;

      @media (max-width: 767px) {
        margin-top: 16px;
      }

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

    /* ── 7. WHY CHOOSE GIFTAURA (ELEGANT BANNER & MOBILE SLIDER) ── */
    .why-choose-section {
      background: transparent;
      padding: 8px 0 20px;

      @media (max-width: 767px) {
        padding: 6px 0 16px;
      }
    }

    .why-choose-card {
      position: relative;
      background: #fdfbf7;
      border: 1px solid #ebdcc5;
      border-radius: 16px;
      padding: 28px 24px 22px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);

      @media (max-width: 991px) {
        padding: 24px 18px 20px;
      }

      @media (max-width: 767px) {
        padding: 18px 12px 14px;
        border-radius: 14px;
      }
    }

    /* Botanical Leaf Accents */
    .why-leaf-accent {
      position: absolute;
      top: 0;
      pointer-events: none;
      z-index: 1;

      &.why-leaf-left {
        left: 0;
      }

      &.why-leaf-right {
        right: 0;
      }

      @media (max-width: 767px) {
        display: none !important;
      }
    }

    /* Header */
    .why-choose-header {
      position: relative;
      z-index: 2;
      text-align: center;
      margin-bottom: 20px;

      @media (max-width: 767px) {
        margin-bottom: 14px;
      }

      .why-eyebrow {
        display: block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #b45309;
        margin-bottom: 5px;
      }

      .why-title {
        font-size: clamp(20px, 2.6vw, 26px);
        font-weight: 800;
        color: #111827;
        margin: 0;
        letter-spacing: -0.015em;
        line-height: 1.25;
      }
    }

    /* Features Grid (Desktop 4-col, Mobile Swipe Slider) */
    .why-features-grid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: stretch;

      @media (max-width: 767px) {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        gap: 10px;
        padding: 4px 4px 8px;
        margin: 0;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        &::-webkit-scrollbar { display: none; }
      }
    }

    .why-feature-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0 16px;
      position: relative;

      @media (min-width: 768px) {
        &:not(:last-child) {
          border-right: 1px solid #ebdcc5;
        }
      }

      @media (max-width: 767px) {
        flex: 0 0 76%;
        max-width: 270px;
        scroll-snap-align: center;
        background: #ffffff;
        border: 1px solid #ebdcc5;
        border-radius: 12px;
        padding: 16px 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }
    }

    .why-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1.5px solid #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #b45309;
      background: #fff8ed;
      margin-bottom: 10px;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.08);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      svg {
        width: 20px;
        height: 20px;
        stroke-width: 1.8;
      }

      &:hover {
        transform: translateY(-2px) scale(1.05);
        border-color: #b45309;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
      }
    }

    .why-feature-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
      line-height: 1.3;
    }

    .why-feature-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.45;
      margin: 0;
      max-width: 220px;
    }

    /* Mobile Slider Dots */
    .why-mobile-dots {
      display: none;

      @media (max-width: 767px) {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
      }

      .why-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #d4c8b5;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.25s ease;

        &.active {
          width: 18px;
          border-radius: 10px;
          background: #1b213b;
        }
      }
    }

    /* ── 8. REVIEWS SLIDER (ELEGANT LUXURY MINIMAL CAROUSEL) ── */
    .reviews-section {
      background: #faf8f5;
      padding: 36px 0 42px;

      @media (max-width: 767px) {
        padding: 24px 0 32px;
      }
    }

    .rev-header {
      text-align: center;
      margin-bottom: 30px;

      @media (max-width: 767px) {
        margin-bottom: 20px;
      }

      .rev-eyebrow-wrap {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .rev-eyebrow-line {
        display: inline-block;
        width: 32px;
        height: 1px;
        background: #d4a359;
      }

      .rev-eyebrow {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #b45309;
      }

      .rev-title {
        font-size: clamp(24px, 3.2vw, 32px);
        font-weight: 700;
        color: #111827;
        margin: 0;
        line-height: 1.25;
        letter-spacing: -0.01em;
      }

      .rev-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 6px 0 0;
      }
    }

    .reviews-slider-container {
      position: relative;
      width: 100%;
    }

    .rev-side-arrow {
      display: none;

      @media (min-width: 768px) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #fbf9f5;
        border: 1px solid #ebdcc5;
        color: #555555;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &.prev {
          left: -21px;
        }

        &.next {
          right: -21px;
        }

        &:hover {
          background: #11141c;
          color: #fbbf24;
          border-color: #11141c;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        &:active {
          transform: translateY(-50%) scale(0.92);
        }
      }

      @media (max-width: 1120px) and (min-width: 768px) {
        &.prev { left: -10px; }
        &.next { right: -10px; }
      }
    }

    .reviews-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding: 4px 2px 10px;

      &::-webkit-scrollbar { display: none; }

      @media (max-width: 767px) {
        gap: 12px;
        padding: 4px 16px 8px;
        margin: 0 -16px;
      }
    }

    .review-slide {
      flex: 0 0 calc(33.333% - 13.33px);
      min-width: calc(33.333% - 13.33px);
      max-width: calc(33.333% - 13.33px);
      scroll-snap-align: start;

      @media (max-width: 1023px) {
        flex: 0 0 calc(50% - 10px);
        min-width: calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      @media (max-width: 767px) {
        flex: 0 0 84%;
        min-width: 84%;
        max-width: 84%;
        scroll-snap-align: center;
      }
    }

    .review-card {
      background: #ffffff;
      border: 1px solid #ebdcc5;
      border-radius: 16px;
      padding: 26px 22px 22px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      height: 100%;
      min-height: 220px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      @media (max-width: 767px) {
        padding: 20px 18px 18px;
        border-radius: 14px;
        min-height: 200px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(184, 138, 68, 0.12);
        border-color: #d4a359;
      }

      .rev-quote-badge {
        color: #c29b53;
        margin-bottom: 14px;
        display: flex;
        align-items: center;

        svg {
          width: 22px;
          height: 18px;
        }
      }

      .rev-comment {
        font-style: italic;
        font-size: 13.5px;
        color: #4b5563;
        line-height: 1.6;
        margin: 0 0 22px;
        flex: 1;
      }

      .rev-author-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: auto;
      }

      .rev-avatar-box {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
      }

      .rev-avatar-img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 1.5px solid #ebdcc5;
        display: block;
      }

      .rev-avatar-fallback {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #11141c;
        color: #fbbf24;
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .rev-author-details {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .rev-author-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #111827;
          line-height: 1.25;
          margin-bottom: 2px;
        }

        .rev-author-role {
          font-size: 11.5px;
          color: #6b7280;
          line-height: 1.25;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rev-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #d97706;
          font-size: 13px;
          line-height: 1;
        }
      }
    }

    .reviews-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 18px;
    }

    .rev-nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #ebdcc5;
      color: #11141c;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.25s ease;

      &:hover {
        background: #11141c;
        color: #fbbf24;
        border-color: #11141c;
      }

      &.mobile-only {
        display: none;
        @media (max-width: 767px) {
          display: flex;
        }
      }
    }

    .reviews-indicators {
      display: flex;
      align-items: center;
      gap: 7px;

      .rev-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ded5c6;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: all 0.25s ease;

        &.active {
          background: #b45309;
          width: 20px;
          border-radius: 10px;
        }

        &:hover:not(.active) {
          background: #b8aa95;
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
      name: 'Priya Sharma',
      role: 'Marketing Head',
      company: 'Infosys',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      comment: 'GiftAura helped us create the perfect gifting solution for our clients. The quality and packaging were absolutely outstanding!'
    },
    {
      name: 'Rohit Mehta',
      role: 'HR Manager',
      company: 'TCS',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      comment: 'Professional, reliable and super easy to work with. Our employees loved the gifts. Highly recommended!'
    },
    {
      name: 'Anjali Verma',
      role: 'Business Development',
      company: 'HDFC Bank',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      comment: 'The team at GiftAura understood our needs perfectly. The custom branding and on-time delivery made all the difference.'
    },
    {
      name: 'Manish Jain',
      role: 'Operations Director',
      company: 'Apex Logistics',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      comment: 'Prompt WhatsApp support and quick turnaround. The customized tech hampers and insulated bottles were top notch.'
    },
    {
      name: 'Vikas Sharma',
      role: 'Procurement Head',
      company: 'Utkarsh Classes',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      comment: 'Ordered polo t-shirts and magnetic badges for our educators. The embroidery was crisp and delivery ahead of schedule.'
    }
  ];

  currentReviewIndex = signal(0);
  private reviewsTimer: any = null;
  isReviewPaused = signal(false);

  private getMaxReviewIndex(): number {
    if (typeof window === 'undefined') return this.customerReviews.length - 1;
    const w = window.innerWidth;
    if (w >= 1024) {
      return Math.max(0, this.customerReviews.length - 3);
    } else if (w >= 768) {
      return Math.max(0, this.customerReviews.length - 2);
    }
    return this.customerReviews.length - 1;
  }

  setReviewIndex(index: number) {
    this.currentReviewIndex.set(index);
    const track = this.document.getElementById('reviews-track');
    const slide = this.document.getElementById('review-slide-' + index);
    if (track && slide) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile) {
        const offset = slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
        track.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
      } else {
        const offset = slide.offsetLeft - track.offsetLeft;
        track.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
      }
    }
  }

  nextReviewSlide() {
    const max = this.getMaxReviewIndex();
    const curr = this.currentReviewIndex();
    const next = curr >= max ? 0 : curr + 1;
    this.setReviewIndex(next);
  }

  prevReviewSlide() {
    const max = this.getMaxReviewIndex();
    const curr = this.currentReviewIndex();
    const prev = curr <= 0 ? max : curr - 1;
    this.setReviewIndex(prev);
  }

  manualNextReview() {
    this.nextReviewSlide();
    this.pauseReviewAutoplay();
    setTimeout(() => this.resumeReviewAutoplay(), 6000);
  }

  manualPrevReview() {
    this.prevReviewSlide();
    this.pauseReviewAutoplay();
    setTimeout(() => this.resumeReviewAutoplay(), 6000);
  }

  manualSetReview(index: number) {
    this.setReviewIndex(index);
    this.pauseReviewAutoplay();
    setTimeout(() => this.resumeReviewAutoplay(), 6000);
  }

  startReviewAutoplay() {
    this.stopReviewAutoplay();
    this.reviewsTimer = setInterval(() => {
      if (!this.isReviewPaused()) {
        this.nextReviewSlide();
      }
    }, 4000);
  }

  stopReviewAutoplay() {
    if (this.reviewsTimer) {
      clearInterval(this.reviewsTimer);
      this.reviewsTimer = null;
    }
  }

  pauseReviewAutoplay() {
    this.isReviewPaused.set(true);
  }

  resumeReviewAutoplay() {
    this.isReviewPaused.set(false);
  }

  onReviewsScroll(el: HTMLElement) {
    const scrollLeft = el.scrollLeft;
    const slide = el.querySelector('.review-slide') as HTMLElement;
    if (slide && slide.clientWidth > 0) {
      const slideWidth = slide.clientWidth + 20;
      const idx = Math.min(this.getMaxReviewIndex(), Math.max(0, Math.round(scrollLeft / slideWidth)));
      if (idx !== this.currentReviewIndex()) {
        this.currentReviewIndex.set(idx);
      }
    }
  }

  readonly activeWhySlide = signal<number>(0);

  onWhyScroll(el: HTMLElement) {
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const card = el.querySelector('.why-feature-col') as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 10 : el.clientWidth * 0.76;
    if (cardWidth > 0) {
      const idx = Math.min(3, Math.max(0, Math.round(scrollLeft / cardWidth)));
      if (idx !== this.activeWhySlide()) {
        this.activeWhySlide.set(idx);
      }
    }
  }

  scrollToWhySlide(index: number, container: HTMLElement) {
    if (!container) return;
    this.activeWhySlide.set(index);
    const cols = container.querySelectorAll('.why-feature-col');
    const target = cols[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
    this.startReviewAutoplay();
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
    this.stopReviewAutoplay();
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
