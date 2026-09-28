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
          <!-- COL 1: REACH OUT TO US -->
          <div class="footer-col">
            <h4 class="footer-title">REACH OUT TO US</h4>
            <div class="footer-contact">
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <p class="contact-text">
                  <strong>Address:</strong> Graphic line, Gandhinagar road, 80 feet Road, bhadwasiya jodhpur, Near Shri Ram Dairy, Jodhpur, Rajasthan - 342007
                </p>
              </div>
              <div class="contact-item">
                <span class="contact-icon">💬</span>
                <p class="contact-text">
                  <strong>WhatsApp:</strong> <a href="https://wa.me/917877605311" target="_blank" rel="noopener">+91 78776-05311</a> / <a href="https://wa.me/916376167116" target="_blank" rel="noopener">+91 63761-67116</a>
                </p>
              </div>
              <div class="contact-item">
                <span class="contact-icon">✉️</span>
                <p class="contact-text">
                  <strong>Email:</strong> <a href="mailto:support@graphicline.in">support&#64;graphicline.in</a>
                </p>
              </div>
              <div class="contact-item">
                <span class="contact-icon">⏰</span>
                <p class="contact-text">
                  <strong>Working Hours:</strong> Mon - Sat: 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>

          <!-- COL 2: HELP -->
          <div class="footer-col">
            <h4 class="footer-title">HELP</h4>
            <ul class="footer-links">
              <li><a routerLink="/" fragment="why-choose">Why Choose Us</a></li>
              <li><a routerLink="/" fragment="inquiry">Bulk Orders & Inquiry</a></li>
              <li><a routerLink="/menu">Explore All Products</a></li>
              <li><a href="https://wa.me/917877605311?text=Hello%20Graphic%20Line%2C%20I%20have%20a%20question" target="_blank" rel="noopener">Customer Support</a></li>
              <li><a routerLink="/my-orders">Track Your Order</a></li>
            </ul>
          </div>

          <!-- COL 3: MENU / COLLECTIONS -->
          <div class="footer-col">
            <h4 class="footer-title">MENU</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/menu">All Collections</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 't-shirts'}">Customized T-Shirts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'welcome-kits'}">Welcome Kits</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'corporate-gifts'}">Corporate Gifts</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'keychains-badges'}">Keychains & Badges</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'office-essentials'}">Office Essentials</a></li>
              <li><a [routerLink]="['/menu']" [queryParams]="{cat: 'drinkware'}">Drinkware & Flasks</a></li>
            </ul>
          </div>

          <!-- COL 4: POLICY & NEWSLETTER -->
          <div class="footer-col">
            <h4 class="footer-title">LET’S GET IN TOUCH</h4>
            <p class="newsletter-desc">Subscribe to receive special corporate offers, new product launches & festive catalog discounts.</p>
            <form class="newsletter-form" (submit)="onSubscribe($event)">
              <div class="nl-input-wrap">
                <input type="email" [(ngModel)]="emailInput" name="email" placeholder="Enter your business email" required>
                <button type="submit" class="nl-btn" aria-label="Subscribe">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
              @if (subscribed) {
                <span class="nl-success">✓ Thank you for subscribing! We'll keep you updated.</span>
              }
            </form>

            <div class="social-block">
              <span class="social-label">Follow Us:</span>
              <div class="social-icons">
                <a href="https://instagram.com/graphicline.in" target="_blank" rel="noopener" class="social-btn" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://wa.me/917877605311" target="_blank" rel="noopener" class="social-btn" title="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="footer-divider"></div>

        <!-- BOTTOM ROW -->
        <div class="footer-bottom">
          <div class="footer-copy">
            <p>© 2026 <strong>Graphic Line</strong> (Gift Aura). All Rights Reserved. Pan-India Delivery.</p>
          </div>
          <div class="payment-methods">
            <span class="pay-badge">UPI</span>
            <span class="pay-badge">VISA</span>
            <span class="pay-badge">MASTERCARD</span>
            <span class="pay-badge">RUPAY</span>
            <span class="pay-badge">NET BANKING</span>
            <span class="pay-badge">100% SECURE</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .gl-footer {
      background-color: var(--color-footer-bg);
      color: var(--color-footer-text);
      padding: 60px 0 30px;
      font-size: 14px;
      margin-top: 60px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 36px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: 1.4fr 0.8fr 1fr 1.3fr;
        gap: 40px;
      }
    }

    .footer-title {
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 20px;
      position: relative;
      padding-bottom: 8px;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 32px;
        height: 2px;
        background: var(--color-accent);
      }
    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .contact-item {
      display: flex;
      gap: 10px;
      line-height: 1.5;

      .contact-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .contact-text {
        color: #d1d1d1;
        font-size: 13.5px;

        strong {
          color: #ffffff;
        }

        a {
          color: #f0f0f0;
          transition: color 0.2s;
          &:hover {
            color: var(--color-accent-light);
            text-decoration: underline;
          }
        }
      }
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      li a {
        color: #cccccc;
        font-size: 14px;
        transition: all 0.2s;
        display: inline-block;

        &:hover {
          color: #ffffff;
          transform: translateX(4px);
        }
      }
    }

    .newsletter-desc {
      color: #b5b5b5;
      font-size: 13.5px;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .newsletter-form {
      margin-bottom: 24px;
    }

    .nl-input-wrap {
      display: flex;
      background: #3a3a3a;
      border: 1px solid #4a4a4a;
      border-radius: var(--radius-sm);
      overflow: hidden;
      transition: border-color 0.2s;

      &:focus-within {
        border-color: var(--color-accent);
      }

      input {
        flex: 1;
        background: transparent;
        border: none;
        padding: 11px 14px;
        color: #ffffff;
        font-size: 13.5px;
        outline: none;

        &::placeholder {
          color: #888888;
        }
      }

      .nl-btn {
        background: var(--color-accent);
        color: #ffffff;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;

        &:hover {
          background: var(--color-accent-light);
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
      background: #404040;
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
        color: #ffffff;
      }
    }

    .payment-methods {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .pay-badge {
        background: #383838;
        color: #e0e0e0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #4a4a4a;
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
