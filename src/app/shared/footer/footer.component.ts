import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <footer class="gl-footer">
      <div class="container">
        <!-- TOP ROW / GRID -->
        <div class="footer-grid">
          <!-- COL 1: BRAND & SOCIAL -->
          <div class="footer-col brand-col">
            <div class="footer-logo">
              <span class="logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </span>
              <strong>GIFT AURA</strong>
            </div>
            <p class="brand-desc">
              Your one-stop destination for custom printed t-shirts, corporate gifts and more.
            </p>
            <div class="social-icons">
              <a href="#" class="social-btn">f</a>
              <a href="#" class="social-btn">in</a>
              <a href="#" class="social-btn">yt</a>
              <a href="#" class="social-btn">ig</a>
            </div>
          </div>

          <!-- COL 2: QUICK LINKS -->
          <div class="footer-col">
            <h4 class="footer-title">Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/menu">Products</a></li>
              <li><a routerLink="/menu">Custom Printing</a></li>
              <li><a routerLink="/">About Us</a></li>
              <li><a routerLink="/">Contact</a></li>
            </ul>
          </div>

          <!-- COL 3: CATEGORIES (Hidden on mobile) -->
          <div class="footer-col hide-on-mobile">
            <h4 class="footer-title">Categories</h4>
            <ul class="footer-links">
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 't-shirts'}">Polo T-Shirts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'corporate-gifts'}">Corporate Gifts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'personalized-gifts'}">Personalized Gifts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'premium-gifts'}">Premium Gifts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'accessories'}">Accessories</a></li>
            </ul>
          </div>

          <!-- COL 4: HELP (Hidden on mobile) -->
          <div class="footer-col hide-on-mobile">
            <h4 class="footer-title">Help</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Shipping Info</a></li>
              <li><a routerLink="/">Returns & Refunds</a></li>
              <li><a routerLink="/">FAQ</a></li>
              <li><a routerLink="/">Terms & Conditions</a></li>
              <li><a routerLink="/">Privacy Policy</a></li>
            </ul>
          </div>

          <!-- COL 5: NEWSLETTER -->
          <div class="footer-col newsletter-col">
            <h4 class="footer-title">Subscribe to Our Newsletter</h4>
            <p class="newsletter-desc">Get latest updates and offers.</p>
            <form class="newsletter-form" (submit)="onSubscribe($event)">
              <div class="nl-input-wrap">
                <input type="email" [(ngModel)]="emailInput" name="email" placeholder="Your email address" required>
                <button type="submit" class="nl-btn" aria-label="Subscribe">→</button>
              </div>
              @if (subscribed) {
                <span class="nl-success">✓ Thank you for subscribing!</span>
              }
            </form>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="footer-divider"></div>

        <!-- BOTTOM ROW -->
        <div class="footer-bottom">
          <div class="footer-copy">
            <p>© 2025 Gift Aura. All rights reserved.</p>
          </div>
          <div class="payment-methods">
            <span class="pay-badge">VISA</span>
            <span class="pay-badge">MASTERCARD</span>
            <span class="pay-badge">UPI</span>
            <span class="pay-badge">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .gl-footer {
      background-color: #3D2B2B;
      color: #C9A8A0;
      padding: 60px 0 30px;
      font-size: 13.5px;

      @media (max-width: 767px) {
        display: none;
      }
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 36px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
        gap: 30px;
      }
    }

    @media (max-width: 767px) {
      .hide-on-mobile {
        display: none;
      }
    }

    .footer-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #F5DDD5;
      margin-bottom: 20px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      strong {
        font-size: 20px;
        color: #F5DDD5;
      }
      span {
        font-size: 11px;
        color: #C9A8A0;
        max-width: 80px;
        line-height: 1.2;
      }
    }

    .brand-desc {
      color: #C9A8A0;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .social-icons {
      display: flex;
      gap: 12px;

      .social-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #5C3A36;
        color: #C9A8A0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        transition: all 0.25s;

        &:hover {
          background: var(--color-accent);
          color: #3D2B2B;
        }
      }
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      li a {
        color: #C9A8A0;
        font-size: 14px;
        transition: all 0.2s;
        display: inline-block;

        &:hover {
          color: #F5DDD5;
          transform: translateX(4px);
        }
      }
    }

    .newsletter-desc {
      color: #C9A8A0;
      font-size: 13.5px;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .newsletter-form {
      margin-bottom: 24px;
    }

    .nl-input-wrap {
      display: flex;
      background: #ffffff;
      border-radius: var(--radius-sm);
      overflow: hidden;

      input {
        flex: 1;
        background: transparent;
        border: none;
        padding: 11px 14px;
        color: #111111;
        font-size: 13.5px;
        outline: none;

        &::placeholder {
          color: #888888;
        }
      }

      .nl-btn {
        background: #C4786A;
        color: #ffffff;
        font-weight: 800;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        border: none;
        cursor: pointer;

        &:hover {
          background: #A85D50;
        }
      }
    }

    .nl-success {
      display: block;
      color: #68d391;
      font-size: 12px;
      margin-top: 8px;
    }

    .social-block {
      display: flex;
      align-items: center;
      gap: 12px;

      .social-label {
        font-size: 13px;
        color: #aaa;
      }

      .social-icons {
        display: flex;
        gap: 8px;
      }

      .social-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #3e3e3e;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s;

        &:hover {
          background: #ffffff;
          color: #111111;
          transform: translateY(-2px);
        }
      }
    }

    .footer-divider {
      height: 1px;
      background: #5C3A36;
      margin: 40px 0 24px;
    }

    .footer-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 13px;
      color: #999999;

      @media (min-width: 768px) {
        flex-direction: row;
      }

      strong {
        color: #F5DDD5;
      }
    }

    .payment-methods {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .pay-badge {
        background: #5C3A36;
        color: #E8C8C0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #7A4C44;
      }
    }
  `]
})
export class FooterComponent {
  emailInput = '';
  subscribed = false;

  onSubscribe(event: Event) {
    event.preventDefault();
    if (this.emailInput.trim()) {
      this.subscribed = true;
      setTimeout(() => {
        this.emailInput = '';
      }, 3000);
    }
  }
}
