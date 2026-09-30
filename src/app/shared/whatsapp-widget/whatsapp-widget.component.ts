import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gl-whatsapp-root">
      <!-- POPUP DIALOG -->
      @if (isOpen()) {
        <div class="gl-wa-modal animate-fade-in-up">
          <div class="gl-wa-header">
            <div class="gl-wa-header-info">
              <div class="gl-wa-avatar-box">
                <span class="gl-wa-header-icon">💬</span>
                <span class="gl-wa-online-dot"></span>
              </div>
              <div>
                <h4 class="gl-wa-header-title">GiftAura Support</h4>
                <p class="gl-wa-header-sub">Typically replies within 15 minutes</p>
              </div>
            </div>
            <button class="gl-wa-close-btn" (click)="toggleOpen()" aria-label="Close">✕</button>
          </div>

          <div class="gl-wa-body">
            <div class="gl-wa-msg-bubble">
              <p>Hi there! 👋 Welcome to <strong>GiftAura</strong>.</p>
              <p class="gl-wa-msg-sub">Chat directly with Rohit for custom branding, samples, or bulk order pricing:</p>
            </div>

            <!-- ROHIT PORWAL -->
            <a href="https://wa.me/918461909143?text=Hi%20Rohit%2C%20I%20am%20interested%20in%20your%20GiftAura%20products%20and%20would%20like%20to%20know%20more%20about%20custom%20gifting%20options." 
               target="_blank" 
               rel="noopener" 
               class="gl-agent-card">
              <div class="gl-agent-avatar">RP</div>
              <div class="gl-agent-details">
                <div class="gl-agent-name">ROHIT PORWAL</div>
                <div class="gl-agent-title">GIFT AURA</div>
                <div class="gl-agent-phone">+91 84619-09143</div>
              </div>
              <div class="gl-agent-chat-btn">
                <span>Chat</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.59 1.38 5.1L2 22l4.99-1.35A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
            </a>
          </div>
        </div>
      }

      <!-- TRIGGER BUTTON -->
      <button class="gl-wa-floating-btn" (click)="toggleOpen()" [class.active]="isOpen()" aria-label="WhatsApp Chat">
        <div class="gl-wa-btn-inner">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span class="gl-wa-badge-pulse"></span>
        </div>
        <span class="gl-wa-tooltip">Chat with us! 👋</span>
      </button>
    </div>
  `,
  styles: [`
    .gl-whatsapp-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: var(--font-family);
    }

    .gl-wa-floating-btn {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #25D366;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 24px rgba(37, 211, 102, 0.55);

        .gl-wa-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-10px);
        }
      }

      &.active {
        background: #128C7E;
        transform: scale(0.95);
      }
    }

    .gl-wa-badge-pulse {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #ff3b30;
      border: 2px solid #ffffff;
      border-radius: 50%;
      animation: pulseGlow 2s infinite;
    }

    .gl-wa-tooltip {
      position: absolute;
      right: 68px;
      background: #111111;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .gl-wa-modal {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 330px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
      border: 1px solid #e8e4df;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .gl-wa-header {
      background: #075E54;
      color: #ffffff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gl-wa-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .gl-wa-avatar-box {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .gl-wa-online-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: #25D366;
      border: 2px solid #075E54;
      border-radius: 50%;
    }

    .gl-wa-header-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
    }

    .gl-wa-header-sub {
      font-size: 11.5px;
      color: #d1fae5;
      margin: 0;
    }

    .gl-wa-close-btn {
      color: #ffffff;
      font-size: 18px;
      padding: 4px;
      opacity: 0.8;
      &:hover { opacity: 1; }
    }

    .gl-wa-body {
      padding: 16px;
      background: #f7f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .gl-wa-msg-bubble {
      background: #ffffff;
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      color: #333333;
      line-height: 1.45;
      border-left: 3px solid #25D366;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);

      p { margin: 0 0 6px; }
      .gl-wa-msg-sub { color: #666; font-size: 12px; margin: 0; }
    }

    .gl-agent-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;

      &:hover {
        border-color: #25D366;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15);
      }
    }

    .gl-agent-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gl-agent-details {
      flex: 1;
    }

    .gl-agent-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #111111;
    }

    .gl-agent-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #059669;
      letter-spacing: 0.3px;
    }

    .gl-agent-phone {
      font-size: 11.5px;
      color: #6b7280;
    }

    .gl-agent-chat-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #25D366;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 20px;
    }
  `]
})
export class WhatsappWidgetComponent {
  readonly isOpen = signal(false);

  toggleOpen() {
    this.isOpen.update(v => !v);
  }
}
