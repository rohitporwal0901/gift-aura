import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <div class="collections-page">
      <!-- HEADER BANNER -->
      <div class="collections-hero">
        <div class="container">
          <div class="breadcrumbs">
            <a routerLink="/">Home</a>
            <span class="bc-sep">/</span>
            <span>Collections</span>
            @if (activeCategory() !== 'all') {
              <span class="bc-sep">/</span>
              <span class="active-crumb">{{ getCategoryTitle() }}</span>
            }
          </div>
          <h1 class="col-title">{{ getCategoryTitle() }}</h1>
          <p class="col-desc">
            Discover precision laser engraved gifts, customized corporate polo uniforms, executive welcome kits, and magnetic name badges.
          </p>
        </div>
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="container col-container">
        <!-- FILTER BAR -->
        <div class="col-filter-bar">
          <div class="categories-scroll-row">
            @for (cat of categories; track cat.id) {
              <button class="cat-pill-btn" 
                      [class.active]="activeCategory() === cat.id" 
                      (click)="setCategory(cat.id)">
                <span>{{ cat.icon }}</span> {{ cat.label }}
              </button>
            }
          </div>

          <!-- SORT & RESULTS ROW -->
          <div class="filter-actions-row">
            <div class="col-results-count">
              Showing <strong>{{ processedProducts().length }}</strong> products
            </div>

            <div class="sort-box">
              <label for="sortSelect">Sort:</label>
              <div class="select-wrapper">
                <select id="sortSelect" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- PRODUCTS GRID -->
        @if (processedProducts().length === 0) {
          <div class="empty-col-state">
            <div class="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try clearing your search query or selecting a different category.</p>
            <button class="gl-btn-primary" (click)="activeCategory.set('all'); searchQuery.set('')">
              Show All Products
            </button>
          </div>
        } @else {
          <div class="col-products-grid">
            @for (product of processedProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .collections-page {
      background: var(--color-bg-canvas);
      min-height: 100vh;
      padding-bottom: 96px;
    }

    .collections-hero {
      background: #faf8f5;
      border-bottom: 1px solid var(--color-border);
      padding: 32px 0 28px;
      text-align: center;

      @media (max-width: 767px) {
        padding: 20px 0 16px;
      }
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12.5px;
      color: #777777;
      margin-bottom: 10px;

      @media (max-width: 767px) {
        font-size: 11.5px;
        margin-bottom: 6px;
        gap: 6px;
      }

      a {
        color: #555555;
        &:hover { color: #111111; text-decoration: underline; }
      }

      .bc-sep { color: #ccc; }
      .active-crumb { color: #111111; font-weight: 700; }
    }

    .col-title {
      font-size: clamp(22px, 3.5vw, 36px);
      font-weight: 900;
      color: #111111;
      letter-spacing: -0.03em;
      margin-bottom: 8px;

      @media (max-width: 767px) {
        font-size: 22px;
        margin-bottom: 4px;
      }
    }

    .col-desc {
      font-size: 13.5px;
      color: #666666;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.5;

      @media (max-width: 767px) {
        font-size: 12px;
        line-height: 1.45;
        padding: 0 10px;
      }
    }

    .col-container {
      margin-top: 18px;

      @media (max-width: 767px) {
        margin-top: 12px;
      }
    }

    .col-filter-bar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
      background: transparent;
      padding: 0;
      border: none;

      @media (max-width: 767px) {
        margin-bottom: 12px;
        gap: 10px;
      }
    }

    .categories-scroll-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 2px 2px 6px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar { display: none; }

      @media (max-width: 767px) {
        margin: 0 -20px;
        padding: 2px 20px 6px;
      }

      .cat-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        color: #374151;
        border: 1px solid #e5e7eb;
        padding: 7px 15px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        transition: all 0.18s ease;
        flex-shrink: 0;

        @media (max-width: 767px) {
          padding: 6px 13px;
          font-size: 12px;
          gap: 5px;
        }

        &:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        &.active {
          background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%);
          color: #FFFFFF;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(169, 124, 67, 0.28);
        }
      }
    }

    .filter-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0 2px;
    }

    .col-results-count {
      font-size: 13px;
      color: #666666;
      margin: 0;

      @media (max-width: 767px) {
        font-size: 12px;
      }

      strong {
        color: #111111;
        font-weight: 700;
      }
    }

    .sort-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;

      @media (max-width: 767px) {
        font-size: 12px;
        gap: 5px;
      }

      label {
        font-size: 12.5px;
        color: #6b7280;

        @media (max-width: 767px) {
          font-size: 11.5px;
        }
      }

      .select-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;

        select {
          appearance: none;
          -webkit-appearance: none;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 6px 28px 6px 11px;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 500;
          color: #1f2937;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          transition: border-color 0.2s;

          &:focus {
            border-color: #111827;
            outline: none;
          }

          @media (max-width: 767px) {
            padding: 5px 24px 5px 9px;
            font-size: 11.5px;
            border-radius: 6px;
          }
        }

        .select-chevron {
          position: absolute;
          right: 9px;
          pointer-events: none;
          color: #6b7280;

          @media (max-width: 767px) {
            right: 7px;
            width: 10px;
            height: 10px;
          }
        }
      }
    }

    .col-products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      @media (max-width: 480px) {
        gap: 10px;
      }

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 28px;
      }
    }

    .empty-col-state {
      text-align: center;
      padding: 80px 20px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid var(--color-border);

      .empty-icon {
        font-size: 50px;
        margin-bottom: 12px;
      }

      h3 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      p {
        font-size: 13.5px;
        color: #666;
        margin-bottom: 20px;
      }
    }
  `]
})
export class MenuComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  readonly activeCategory = signal<string>('all');
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<string>('featured');

  categories = [
    { id: 'all', label: 'All Products', icon: '✦' },
    { id: 't-shirts', label: 'Customized T-Shirts', icon: '👕' },
    { id: 'welcome-kits', label: 'Welcome Kits', icon: '🎁' },
    { id: 'corporate-gifts', label: 'Pens & Diaries', icon: '✒️' },
    { id: 'keychains-badges', label: 'Keychains & Badges', icon: '🏷️' },
    { id: 'office-essentials', label: 'Office Essentials', icon: '📱' },
    { id: 'drinkware', label: 'Vacuum Flasks', icon: '🧊' }
  ];

  allProducts = computed(() => this.productService.getAll());

  processedProducts = computed(() => {
    let list = this.allProducts();

    // Category filter
    const cat = this.activeCategory();
    if (cat !== 'all') {
      list = list.filter(p => p.category === cat);
    }

    // Search query filter
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...list];
    const sortVal = this.sortBy();
    if (sortVal === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.activeCategory.set(params['cat']);
      }
    });
  }

  setCategory(id: string) {
    this.activeCategory.set(id);
  }

  getCategoryTitle(): string {
    const cat = this.categories.find(c => c.id === this.activeCategory());
    return cat ? cat.label : 'All Corporate Products';
  }
}
