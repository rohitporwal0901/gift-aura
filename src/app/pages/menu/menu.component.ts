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

          <!-- SEARCH & SORT -->
          <div class="filter-actions-row">
            <div class="search-input-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Search in collection..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)">
              @if (searchQuery()) {
                <button class="clear-search-btn" (click)="searchQuery.set('')">✕</button>
              }
            </div>

            <div class="sort-box">
              <label for="sortSelect">Sort:</label>
              <select id="sortSelect" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <!-- PRODUCTS COUNT -->
        <div class="col-results-count">
          Showing <strong>{{ processedProducts().length }}</strong> products
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
      padding-bottom: 80px;
    }

    .collections-hero {
      background: #faf8f5;
      border-bottom: 1px solid var(--color-border);
      padding: 36px 0 32px;
      text-align: center;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12.5px;
      color: #777777;
      margin-bottom: 12px;

      a {
        color: #555555;
        &:hover { color: #111111; text-decoration: underline; }
      }

      .bc-sep { color: #ccc; }
      .active-crumb { color: #111111; font-weight: 700; }
    }

    .col-title {
      font-size: clamp(24px, 3.5vw, 38px);
      font-weight: 900;
      color: #111111;
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }

    .col-desc {
      font-size: 14px;
      color: #666666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.55;
    }

    .col-container {
      margin-top: 32px;
    }

    .col-filter-bar {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 24px;
      background: #ffffff;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }

    .categories-scroll-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      .cat-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f7f5f2;
        color: #333333;
        border: 1px solid #e2ddd5;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        transition: all 0.2s;

        &:hover {
          background: #eae5dc;
          border-color: #111;
        }

        &.active {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }
      }
    }

    .filter-actions-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border-top: 1px solid #f4f0eb;
      padding-top: 14px;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #faf8f5;
      border: 1px solid #dcd7cf;
      border-radius: 6px;
      padding: 7px 12px;
      flex: 1;
      max-width: 380px;

      input {
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: 13.5px;
        color: #111;
        width: 100%;
      }

      .clear-search-btn {
        color: #888;
        font-size: 12px;
        &:hover { color: #111; }
      }
    }

    .sort-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;

      select {
        border: 1px solid #dcd7cf;
        border-radius: 6px;
        padding: 7px 12px;
        font-family: inherit;
        font-size: 13px;
        color: #111;
        background: #faf8f5;
        outline: none;
        cursor: pointer;
      }
    }

    .col-results-count {
      font-size: 13px;
      color: #777777;
      margin-bottom: 20px;
    }

    .col-products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

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
