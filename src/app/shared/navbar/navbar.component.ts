import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <!-- MAIN HEADER -->
    <header class="gl-header" [class.scrolled]="isScrolled()">
      <div class="container header-inner">
        <!-- MOBILE HAMBURGER -->
        <button class="mobile-toggle-btn hide-desktop" (click)="toggleMobileMenu()" aria-label="Toggle navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <!-- BRAND LOGO -->
        <a routerLink="/" class="gl-brand" title="Gift Aura Home">
          <div class="brand-text-fallback" id="textBrand">
            <span class="bt-name">GIFT<span class="bt-gold">AURA</span></span>
            <span class="bt-tag">CUSTOM GIFTS & PRINTING</span>
          </div>
        </a>

        <!-- DESKTOP NAV -->
        <nav class="gl-desktop-nav hide-mobile">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">Home</a>
          <a routerLink="/menu" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">All Collections</a>
          <a [routerLink]="['/menu']" [queryParams]="{cat: 't-shirts'}" class="nav-item">Customized T-Shirts</a>
          <a [routerLink]="['/menu']" [queryParams]="{cat: 'welcome-kits'}" class="nav-item">Welcome Kits</a>
          <a [routerLink]="['/menu']" [queryParams]="{cat: 'corporate-gifts'}" class="nav-item">Corporate Gifts</a>
          <a [routerLink]="['/menu']" [queryParams]="{cat: 'keychains-badges'}" class="nav-item">Keychains & Badges</a>
        </nav>

        <!-- RIGHT ACTIONS -->
        <div class="header-actions">
          <!-- USER ACCOUNT -->
          @if (authService.isLoggedIn()) {
            <button class="action-btn user-btn" (click)="openProfile()" title="My Account" style="background: none; border: none; cursor: pointer;">
              <span class="avatar-initial">{{ getUserInitial() }}</span>
            </button>
          } @else {
            <button class="action-btn" (click)="openAuth()" title="Login / Register" style="background: none; border: none; cursor: pointer;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          }

          <!-- CART TRIGGER -->
          <button class="action-btn cart-btn-wrap" (click)="openCart()" aria-label="View shopping cart">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            @if (cartService.totalItems() > 0) {
              <span class="cart-bubble">{{ cartService.totalItems() }}</span>
            }
          </button>
        </div>
      </div>
    </header>

    <!-- SEARCH OVERLAY MODAL -->
    @if (showSearch()) {
      <div class="search-overlay" (click)="toggleSearch()">
        <div class="search-modal" (click)="$event.stopPropagation()">
          <div class="sm-header">
            <div class="sm-input-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" 
                     placeholder="Search corporate gifts, pens, t-shirts, welcome kits..." 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="onSearchChange()"
                     autofocus>
              <button class="sm-close-btn" (click)="toggleSearch()">✕</button>
            </div>
          </div>

          <!-- SEARCH RESULTS -->
          <div class="sm-results">
            @if (searchQuery.trim().length > 0) {
              <div class="sm-results-header">
                <span>{{ searchResults().length }} Products found for "{{ searchQuery }}"</span>
              </div>
              <div class="sm-results-grid">
                @for (prod of searchResults(); track prod.id) {
                  <a [routerLink]="['/product', prod.id]" (click)="toggleSearch()" class="sm-result-item">
                    <img [src]="prod.image" [alt]="prod.name">
                    <div class="sm-prod-details">
                      <h4 class="sm-prod-name">{{ prod.name }}</h4>
                      <div class="sm-price-row">
                        <span class="sm-price">₹{{ prod.price }}</span>
                        @if (prod.originalPrice) {
                          <span class="sm-orig">₹{{ prod.originalPrice }}</span>
                        }
                      </div>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <div class="sm-quick-links">
                <span class="sm-quick-title">Popular Searches:</span>
                <div class="sm-pills">
                  <button (click)="searchQuery = 'Polo T-Shirts'; onSearchChange()" class="quick-pill">Custom Polo T-Shirts</button>
                  <button (click)="searchQuery = 'Engraved Pens'; onSearchChange()" class="quick-pill">Engraved Metal Pens</button>
                  <button (click)="searchQuery = 'Welcome Kit'; onSearchChange()" class="quick-pill">Welcome Kits</button>
                  <button (click)="searchQuery = 'Keychains'; onSearchChange()" class="quick-pill">Metal Keychains</button>
                  <button (click)="searchQuery = 'Visiting Card'; onSearchChange()" class="quick-pill">Visiting Card Holder</button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- MOBILE NAVIGATION DRAWER -->
    @if (showMobileMenu()) {
      <div class="mobile-drawer-backdrop" (click)="toggleMobileMenu()"></div>
      <div class="mobile-drawer">
        <div class="md-header">
          <div class="bt-name">GIFT<span class="bt-gold">AURA</span></div>
          <button class="md-close" (click)="toggleMobileMenu()">✕</button>
        </div>

        <div class="md-body">
          <nav class="md-links">
            <a routerLink="/" (click)="toggleMobileMenu()" class="md-link">
              <span>Home</span>
              <span class="md-arrow">›</span>
            </a>
            <a routerLink="/menu" (click)="toggleMobileMenu()" class="md-link">
              <span>All Collections</span>
              <span class="md-arrow">›</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 't-shirts'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Customized T-Shirts</span>
              <span class="md-tag">Popular</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 'welcome-kits'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Welcome Kits & Combo Sets</span>
              <span class="md-tag">Trending</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 'corporate-gifts'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Corporate Gifts & Diaries</span>
              <span class="md-arrow">›</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 'keychains-badges'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Keychains & Magnetic Badges</span>
              <span class="md-arrow">›</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 'office-essentials'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Office Essentials & Mobile Stands</span>
              <span class="md-arrow">›</span>
            </a>
            <a [routerLink]="['/menu']" [queryParams]="{cat: 'drinkware'}" (click)="toggleMobileMenu()" class="md-link">
              <span>Drinkware & Vacuum Flasks</span>
              <span class="md-arrow">›</span>
            </a>
          </nav>

          <div class="md-contact-box">
            <div class="md-contact-title">Quick Corporate Support</div>
            <p>Direct WhatsApp with our Sales Managers for bulk inquiries and quotation:</p>
            <a href="https://wa.me/917877605311?text=Hi%20Graphic%20Line%2C%20I%20want%20to%20inquire%20about%20corporate%20gifting" 
               target="_blank" 
               rel="noopener" 
               class="md-wa-btn">
              <span>WhatsApp Us: +91 78776-05311</span>
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── HEADER ── */
    .gl-header {
      background: #ffffff;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: all 0.25s ease;

      &.scrolled {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }

    /* ── BRAND LOGO ── */
    .gl-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
      
      @media (min-width: 769px) {
        flex: 1; /* take space on left to center the nav on desktop */
      }
    }

    .brand-text-fallback {
      display: flex;
      flex-direction: column;

      .bt-name {
        font-family: var(--font-heading);
        font-size: 22px;
        font-weight: 900;
        letter-spacing: -0.5px;
        color: #111111;
        line-height: 1;

        .bt-gold {
          color: var(--color-accent);
        }
      }

      .bt-tag {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #777777;
        margin-top: 3px;
      }
    }

    /* ── DESKTOP NAV ── */
    .gl-desktop-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px; /* Added gap between items */
      flex: 2; /* takes middle space */

      .nav-item {
        font-size: 13.5px;
        font-weight: 600;
        color: #222222;
        padding: 8px 0;
        position: relative;
        white-space: nowrap; /* PREVENTS WRAPPING (UPAR NICHE) */
        transition: color 0.2s;

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0%;
          height: 3px;
          background: var(--color-accent); /* Yellow underline like screenshot */
          border-radius: 4px;
          transition: width 0.25s ease;
        }

        &:hover, &.active {
          color: #111111;

          &::after {
            width: 80%; /* not full width, centered */
          }
        }
      }
    }

    /* ── RIGHT ACTIONS ── */
    .header-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      
      @media (min-width: 769px) {
        flex: 1; /* take space on right on desktop */
      }
      @media (max-width: 768px) {
        margin-left: auto; /* Push to right on mobile */
      }
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #222222;
      background: transparent;
      transition: all 0.2s;

      &:hover {
        background: #f3efea;
        color: #000000;
      }
    }

    .cart-btn-wrap {
      position: relative;
    }

    .cart-bubble {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #e84e4e;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      min-width: 17px;
      height: 17px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .avatar-initial {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #111111;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-toggle-btn {
      color: #111111;
      padding: 6px;
      margin-right: 8px; /* space between hamburger and logo */
    }

    /* ── SEARCH OVERLAY ── */
    .search-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      justify-content: center;
      padding-top: 60px;
    }

    .search-modal {
      width: 90%;
      max-width: 680px;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalSlide 0.25s ease;
    }

    @keyframes modalSlide {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sm-header {
      padding: 16px 20px;
      border-bottom: 1px solid #eeebe6;
    }

    .sm-input-row {
      display: flex;
      align-items: center;
      gap: 12px;

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        font-family: inherit;
        color: #111111;
      }

      .sm-close-btn {
        font-size: 18px;
        color: #777;
        &:hover { color: #111; }
      }
    }

    .sm-results {
      padding: 20px;
      overflow-y: auto;
    }

    .sm-results-header {
      font-size: 12.5px;
      color: #777777;
      margin-bottom: 14px;
      font-weight: 600;
    }

    .sm-results-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sm-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #f0ece6;
      transition: all 0.2s;

      &:hover {
        background: #fbf9f6;
        border-color: #dfd8ce;
        transform: translateX(4px);
      }

      img {
        width: 50px;
        height: 50px;
        border-radius: 6px;
        object-fit: cover;
      }

      .sm-prod-name {
        font-size: 13.5px;
        font-weight: 700;
        color: #111111;
      }

      .sm-price {
        font-weight: 700;
        color: #111111;
        font-size: 13.5px;
      }

      .sm-orig {
        font-size: 11.5px;
        color: #999;
        text-decoration: line-through;
        margin-left: 6px;
      }
    }

    .sm-quick-title {
      font-size: 12px;
      color: #777777;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 10px;
    }

    .sm-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .quick-pill {
        background: #f4f0eb;
        color: #333333;
        font-size: 12.5px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 20px;
        transition: all 0.2s;

        &:hover {
          background: #111111;
          color: #ffffff;
        }
      }
    }

    /* ── MOBILE DRAWER ── */
    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99998;
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 82%;
      max-width: 320px;
      background: #ffffff;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      animation: slideInLeft 0.25s ease;
    }

    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    .md-header {
      padding: 18px 20px;
      border-bottom: 1px solid #eeebe6;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .md-close {
        font-size: 18px;
        color: #555;
      }
    }

    .md-body {
      padding: 16px 20px;
      overflow-y: auto;
      flex: 1;
    }

    .md-links {
      display: flex;
      flex-direction: column;

      .md-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid #f4f0eb;
        font-size: 14.5px;
        font-weight: 600;
        color: #222222;

        .md-arrow { color: #aaa; font-size: 18px; }

        .md-tag {
          background: #e84e4e;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
      }
    }

    .md-contact-box {
      margin-top: 30px;
      padding: 16px;
      background: #f9f7f4;
      border-radius: 10px;
      font-size: 12.5px;
      color: #666666;

      .md-contact-title {
        font-weight: 700;
        color: #111111;
        margin-bottom: 6px;
      }

      .md-wa-btn {
        display: block;
        margin-top: 10px;
        background: #25D366;
        color: #ffffff;
        text-align: center;
        padding: 9px;
        border-radius: 6px;
        font-weight: 700;
      }
    }

    /* ── RESPONSIVE UTILS ── */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }

    @media (min-width: 769px) {
      .hide-desktop { display: none !important; }
    }
  `]
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  productService = inject(ProductService);

  readonly isScrolled = signal(false);
  readonly showSearch = signal(false);
  readonly showMobileMenu = signal(false);
  searchQuery = '';
  readonly searchResults = signal<Product[]>([]);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleSearch() {
    this.showSearch.update(v => !v);
    if (this.showSearch()) {
      this.searchQuery = '';
      this.searchResults.set([]);
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(v => !v);
  }

  openCart() {
    this.cartService.openDrawer();
  }

  openProfile() {
    this.cartService.openProfile();
  }

  openAuth() {
    this.cartService.openDrawer();
    // It will show auth modal automatically because of isLoggedIn() check in drawer
  }

  onSearchChange() {
    if (this.searchQuery.trim().length > 1) {
      this.searchResults.set(this.productService.search(this.searchQuery));
    } else {
      this.searchResults.set([]);
    }
  }

  getUserInitial(): string {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    return (user.name || user.email || 'U')[0].toUpperCase();
  }
}
