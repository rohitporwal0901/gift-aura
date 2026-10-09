import { Component, inject, signal, ViewChildren, QueryList, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { User } from '../../core/models/user.model';

type AuthStep = 'phone' | 'pin' | 'register';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="inlineMode ? 'auth-inline' : 'auth-backdrop'" (click)="!inlineMode && close()">
      <div [class]="inlineMode ? 'auth-inline-sheet' : 'auth-sheet'" (click)="$event.stopPropagation()">
        
        <!-- TOP NAVIGATION BAR -->
        <div class="auth-top-nav">
          @if (step() !== 'phone') {
            <button class="auth-nav-pill-btn" (click)="handleBack()" type="button" aria-label="Go Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Back</span>
            </button>
          } @else {
            <div class="auth-secure-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>100% Secure Auth</span>
            </div>
          }

          <!-- CLOSE BUTTON (ALWAYS VISIBLE TO DISMISS DRAWER OR MODAL) -->
          <button class="auth-close-btn" (click)="close()" type="button" aria-label="Close panel">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- MAIN SCROLLABLE CONTENT -->
        <div class="auth-content-body">
          
          <!-- BRAND LOGO -->
          <div class="auth-brand-hero">
            <div class="brand-logo-frame">
              <svg viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" height="42" width="auto">
                <g transform="translate(0, 3)">
                  <path d="M16 7 Q20 3 24 7" stroke="#A97C43" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                  <path d="M24 7 Q28 3 32 7" stroke="#A97C43" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                  <circle cx="24" cy="7" r="2" fill="#A97C43"/>
                  <rect x="11" y="8" width="26" height="6" rx="1.5" fill="#A97C43"/>
                  <rect x="23" y="8" width="2.8" height="6" fill="#0B2A44"/>
                  <rect x="12" y="15" width="24" height="17" rx="2" fill="#0B2A44"/>
                  <rect x="23" y="15" width="2.8" height="17" fill="#A97C43"/>
                  <circle cx="8" cy="6" r="1.2" fill="#A97C43" opacity="0.8"/>
                  <circle cx="40" cy="4" r="1.1" fill="#A97C43" opacity="0.7"/>
                </g>
                <text x="44" y="29" font-family="'Libre Caslon Text', Georgia, serif" font-weight="700" font-size="22" fill="#0B2A44" letter-spacing="-0.5">GIFT</text>
                <text x="96" y="29" font-family="'Libre Caslon Text', Georgia, serif" font-weight="700" font-size="22" fill="#A97C43" letter-spacing="-0.5">AURA</text>
                <text x="44" y="41" font-family="'Inter', sans-serif" font-weight="700" font-size="6.8" fill="#6A7480" letter-spacing="1.5">CUSTOM GIFTS &amp; PRINTING</text>
              </svg>
            </div>
          </div>

          <!-- ERROR ALERT -->
          @if (errorMessage()) {
            <div class="error-banner animate-shake">
              <div class="alert-icon-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- SUCCESS ALERT -->
          @if (successMessage()) {
            <div class="success-banner animate-fade">
              <div class="alert-icon-wrap succ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <!-- STEP 1: PHONE NUMBER ENTRY -->
          @if (step() === 'phone') {
            <div class="step-card animate-fade">
              <div class="header-intro">
                <h2 class="auth-main-title">Welcome to GiftAura</h2>
                <p class="auth-subtitle">Enter your 10-digit mobile number to login or continue shopping</p>
              </div>

              <!-- INDIAN FLAG & PHONE INPUT CONTAINER -->
              <div class="phone-input-card" [class.has-focus]="isPhoneFocused" [class.is-valid]="phone.trim().length === 10">
                <!-- INDIAN FLAG + COUNTRY CODE -->
                <div class="country-prefix">
                  <div class="flag-badge" title="India (+91)">
                    <!-- Authentic Indian Tricolor (Tiranga) SVG -->
                    <svg class="tiranga-flag" viewBox="0 0 36 24" width="24" height="17" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="2.5" fill="#FFFFFF"/>
                      <rect width="36" height="8" rx="2.5" fill="#FF9933"/>
                      <rect y="16" width="36" height="8" rx="2.5" fill="#138808"/>
                      <circle cx="18" cy="12" r="3.2" fill="none" stroke="#000080" stroke-width="0.8"/>
                      <circle cx="18" cy="12" r="0.8" fill="#000080"/>
                      <g stroke="#000080" stroke-width="0.35">
                        <line x1="18" y1="9" x2="18" y2="15"/>
                        <line x1="15" y1="12" x2="21" y2="12"/>
                        <line x1="15.8" y1="9.8" x2="20.2" y2="14.2"/>
                        <line x1="15.8" y1="14.2" x2="20.2" y2="9.8"/>
                        <line x1="16.8" y1="9.2" x2="19.2" y2="14.8"/>
                        <line x1="19.2" y1="9.2" x2="16.8" y2="14.8"/>
                        <line x1="15.2" y1="10.8" x2="20.8" y2="13.2"/>
                        <line x1="15.2" y1="13.2" x2="20.8" y2="10.8"/>
                      </g>
                    </svg>
                  </div>
                  <span class="country-dial-code">+91</span>
                  <span class="prefix-divider"></span>
                </div>

                <!-- INPUT FIELD -->
                <input 
                  type="tel" 
                  class="phone-native-input" 
                  placeholder="Enter Mobile Number" 
                  [(ngModel)]="phone" 
                  maxlength="10"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  (input)="onPhoneInput($event)"
                  (keyup.enter)="checkPhone()"
                  (focus)="isPhoneFocused = true"
                  (blur)="isPhoneFocused = false"
                  autofocus
                />

                <!-- CLEAR OR CHECKMARK BUTTON -->
                @if (phone.length > 0) {
                  <div class="input-actions-wrap">
                    @if (phone.trim().length === 10) {
                      <span class="success-check-badge" title="Valid mobile number">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    }
                    <button type="button" class="clear-digits-btn" (click)="clearPhone()" aria-label="Clear number">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                }
              </div>

              <!-- PRIMARY CONTINUE BUTTON -->
              <button 
                type="button" 
                class="primary-submit-btn" 
                [disabled]="phone.trim().length !== 10 || isLoading()"
                (click)="checkPhone()"
              >
                @if (isLoading()) {
                  <div class="btn-spinner"></div>
                  <span>Checking...</span>
                } @else {
                  <span>Continue</span>
                  <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                }
              </button>

              <p class="terms-caption">
                By continuing, you agree to GiftAura's 
                <span class="legal-link">Terms of Service</span> &amp; 
                <span class="legal-link">Privacy Policy</span>
              </p>
            </div>
          }

          <!-- STEP 2: PIN LOGIN (EXISTING USER) -->
          @if (step() === 'pin') {
            <div class="step-card animate-fade">
              <div class="user-chip-row">
                <div class="phone-verified-chip">
                  <span class="chip-flag">🇮🇳</span>
                  <span class="chip-num">+91 {{ formatPhone(phone) }}</span>
                  <button class="chip-edit-btn" (click)="step.set('phone')" type="button">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div class="header-intro">
                <h2 class="auth-main-title">Enter 4-Digit Security PIN</h2>
                <p class="auth-subtitle">
                  Welcome back, <strong class="user-name-highlight">{{ existingUserName() }}</strong>! Enter your PIN to continue
                </p>
              </div>

              <!-- PIN INPUT BOXES -->
              <div class="pin-digits-wrap">
                @for (digit of pinDigits; track $index; let i = $index) {
                  <input 
                    #pinInput
                    type="password" 
                    inputmode="numeric"
                    maxlength="1" 
                    class="pin-box"
                    [value]="digit"
                    (input)="onPinInput($event, i)"
                    (keydown)="onPinKeyDown($event, i)"
                    [class.filled]="digit !== ''"
                  />
                }
              </div>

              <button 
                type="button" 
                class="primary-submit-btn" 
                [disabled]="getCompletePin().length !== 4 || isLoading()"
                (click)="submitPinLogin()"
              >
                @if (isLoading()) {
                  <div class="btn-spinner"></div>
                  <span>Verifying PIN...</span>
                } @else {
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="margin-right: 6px;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Login Securely</span>
                }
              </button>

              <div class="forgot-pin-row">
                <button class="forgot-pin-btn" (click)="resetToRegister()" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Forgot PIN or reset account?</span>
                </button>
              </div>
            </div>
          }

          <!-- STEP 3: REGISTRATION FOR NEW USERS -->
          @if (step() === 'register') {
            <div class="step-card animate-fade">
              <div class="user-chip-row">
                <div class="phone-verified-chip">
                  <span class="chip-flag">🇮🇳</span>
                  <span class="chip-num">+91 {{ formatPhone(phone) }}</span>
                  <button class="chip-edit-btn" (click)="step.set('phone')" type="button">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div class="header-intro">
                <h2 class="auth-main-title">Create Your Account</h2>
                <p class="auth-subtitle">Set up your profile to personalize gifts & track orders</p>
              </div>

              <div class="registration-form">
                <!-- FULL NAME INPUT -->
                <div class="form-field-group">
                  <label class="field-label">
                    <span>Your Full Name</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="field-input-box">
                    <span class="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      class="field-input" 
                      placeholder="e.g. Rahul Sharma" 
                      [(ngModel)]="name"
                      autocomplete="name"
                    />
                  </div>
                </div>

                <!-- 4-DIGIT PIN -->
                <div class="form-field-group">
                  <div class="label-with-tip">
                    <label class="field-label">
                      <span>Create 4-Digit Security PIN</span>
                      <span class="required-star">*</span>
                    </label>
                    <span class="field-subtip">Used for 1-tap login</span>
                  </div>
                  <div class="pin-digits-wrap compact">
                    @for (digit of registerPinDigits; track $index; let i = $index) {
                      <input 
                        #regPinInput
                        type="password" 
                        inputmode="numeric"
                        maxlength="1" 
                        class="pin-box"
                        [value]="digit"
                        (input)="onRegPinInput($event, i)"
                        (keydown)="onRegPinKeyDown($event, i)"
                        [class.filled]="digit !== ''"
                      />
                    }
                  </div>
                  <p class="pin-explainer">No OTP wait! You'll use this 4-digit PIN to securely log in next time.</p>
                </div>

                <!-- SUBMIT BUTTON -->
                <button 
                  type="button" 
                  class="primary-submit-btn" 
                  [disabled]="!name.trim() || getRegisterPin().length !== 4 || isLoading()"
                  (click)="submitRegister()"
                >
                  @if (isLoading()) {
                    <div class="btn-spinner"></div>
                    <span>Creating Profile...</span>
                  } @else {
                    <span>Save Profile & Start Gifting</span>
                    <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  }
                </button>
              </div>
            </div>
          }

          

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      height: 100%;
      width: 100%;
    }

    /* INLINE CONTAINER (DRAWER MODE) */
    .auth-inline {
      width: 100%;
      height: 100%;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .auth-inline-sheet {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: #FFFFFF;
      box-sizing: border-box;
      padding: max(16px, env(safe-area-inset-top)) 18px max(20px, env(safe-area-inset-bottom));
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    /* MODAL BACKDROP (POPUP MODE) */
    .auth-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 2500;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.22s ease-out;
    }

    @media (min-width: 640px) {
      .auth-backdrop {
        align-items: center;
        padding: 20px;
      }
    }

    .auth-sheet {
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      border-radius: 24px 24px 0 0;
      padding: 20px 22px 28px;
      box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      max-height: 94vh;
      overflow-y: auto;
    }

    @media (min-width: 640px) {
      .auth-sheet {
        border-radius: 24px;
        padding: 24px 26px 30px;
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.28);
      }
    }

    /* TOP NAVIGATION */
    .auth-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 12px;
      min-height: 38px;
    }

    .auth-nav-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F4F4F5;
      border: 1px solid #E4E4E7;
      color: #18181B;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      &:hover {
        background: #E4E4E7;
        color: #000000;
      }

      &:active {
        transform: scale(0.96);
      }
    }

    .auth-secure-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FEF9C3;
      border: 1px solid #FEF08A;
      color: #854D0E;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    .auth-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #F4F4F5;
      border: 1px solid #E4E4E7;
      color: #52525B;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;

      &:hover {
        background: #18181B;
        border-color: #18181B;
        color: #FFFFFF;
        transform: rotate(90deg);
      }

      &:active {
        transform: scale(0.92);
      }
    }

    /* SCROLLABLE BODY */
    .auth-content-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
    }

    /* BRAND HERO */
    .auth-brand-hero {
      display: flex;
      justify-content: center;
      margin: 4px 0 16px;
    }

    .brand-logo-frame {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 14px;
      border-radius: 14px;
      background: linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%);
      border: 1px solid #E4E4E7;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }

    /* ALERTS */
    .error-banner {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #B91C1C;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .success-banner {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #15803D;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .alert-icon-wrap {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #FEE2E2;
      color: #DC2626;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.succ {
        background: #DCFCE7;
        color: #16A34A;
      }
    }

    /* STEP CARD */
    .step-card {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .header-intro {
      margin-bottom: 18px;
    }

    .auth-main-title {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 21px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 6px;
      letter-spacing: -0.4px;
      line-height: 1.25;
    }

    .auth-subtitle {
      font-size: 13.5px;
      color: #64748B;
      margin: 0;
      line-height: 1.45;
    }

    .user-name-highlight {
      color: #0F172A;
      font-weight: 800;
    }

    /* PHONE INPUT CARD */
    .phone-input-card {
      display: flex;
      align-items: center;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      height: 52px;
      padding: 0 12px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      margin-bottom: 16px;
      box-sizing: border-box;

      &.has-focus {
        border-color: var(--navy);
        background: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(2, 74, 123, 0.12);
      }

      &.is-valid {
        border-color: var(--navy);
      }
    }

    .country-prefix {
      display: flex;
      align-items: center;
      gap: 7px;
      padding-right: 10px;
      flex-shrink: 0;
    }

    .flag-badge {
      display: flex;
      align-items: center;
      line-height: 0;
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .tiranga-flag {
      display: block;
      height: 16px;
      width: auto;
    }

    .country-dial-code {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: 0.3px;
    }

    .prefix-divider {
      width: 1px;
      height: 22px;
      background: #CBD5E1;
      margin-left: 2px;
    }

    .phone-native-input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-family: inherit;
      font-size: 16px;
      font-weight: 700;
      color: #0F172A;
      padding-left: 8px;
      letter-spacing: 0.8px;

      &::placeholder {
        font-weight: 400;
        font-size: 14px;
        letter-spacing: 0;
        color: #94A3B8;
      }
    }

    .input-actions-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-left: 4px;
    }

    .success-check-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #16A34A;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .clear-digits-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #E2E8F0;
      border: none;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #CBD5E1;
        color: #1E293B;
      }
    }

    /* PRIMARY CTA BUTTON */
    .primary-submit-btn {
      width: 100%;
      height: 50px;
      background: linear-gradient(135deg, #C59A60 0%, #A97C43 50%, #8E6633 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      font-family: inherit;
      font-size: 15.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 6px 18px rgba(169, 124, 67, 0.32);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .btn-arrow {
        transition: transform 0.2s ease;
      }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #0B2A44 0%, #024A7B 100%);
        box-shadow: 0 8px 24px rgba(2, 74, 123, 0.35);
        transform: translateY(-1.5px);

        .btn-arrow {
          transform: translateX(3px);
        }
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
        box-shadow: 0 3px 10px rgba(217, 119, 6, 0.3);
      }

      &:disabled {
        background: #F1F5F9;
        color: #94A3B8;
        border: 1px solid #E2E8F0;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2.5px solid #0F172A;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .terms-caption {
      font-size: 11.5px;
      color: #94A3B8;
      text-align: center;
      margin: 14px 0 4px;
      line-height: 1.5;
    }

    .legal-link {
      color: #B45309;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }

    /* STEP 2 & 3 USER CHIP ROW */
    .user-chip-row {
      display: flex;
      margin-bottom: 12px;
    }

    .phone-verified-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 700;
      color: #1E293B;

      .chip-flag {
        font-size: 14px;
      }

      .chip-num {
        letter-spacing: 0.4px;
      }
    }

    .chip-edit-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      color: #D97706;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      padding: 0 0 0 4px;
      text-decoration: underline;

      &:hover {
        color: #B45309;
      }
    }

    /* PIN DIGIT BOXES */
    .pin-digits-wrap {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 18px 0 22px;

      &.compact {
        margin: 10px 0 14px;
      }
    }

    .pin-box {
      width: 52px;
      height: 56px;
      border-radius: 14px;
      border: 2px solid #E2E8F0;
      background: #F8FAFC;
      font-size: 24px;
      font-weight: 800;
      text-align: center;
      color: #0F172A;
      outline: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;

      &:focus {
        border-color: var(--navy);
        background: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(2, 74, 123, 0.14);
        transform: scale(1.05);
      }

      &.filled {
        border-color: var(--navy);
        background: var(--navy-soft, #E4EDF4);
      }
    }

    .forgot-pin-row {
      margin-top: 14px;
      text-align: center;
    }

    .forgot-pin-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: #D97706;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      padding: 6px;

      &:hover {
        text-decoration: underline;
        color: #B45309;
      }
    }

    /* REGISTRATION FORM */
    .registration-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 8px;
    }

    .form-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required-star {
      color: #DC2626;
      font-weight: 800;
    }

    .label-with-tip {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .field-subtip {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }

    .field-input-box {
      display: flex;
      align-items: center;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      height: 48px;
      padding: 0 12px;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: var(--navy);
        background: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(2, 74, 123, 0.12);
      }
    }

    .field-icon {
      color: #94A3B8;
      display: flex;
      align-items: center;
      margin-right: 8px;
    }

    .field-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14.5px;
      font-family: inherit;
      color: #0F172A;
      font-weight: 600;

      &::placeholder {
        color: #94A3B8;
        font-weight: 400;
      }
    }

    .pin-explainer {
      font-size: 11px;
      color: #64748B;
      margin: 0;
      line-height: 1.4;
      text-align: center;
    }

    /* TRUST & PERKS SHOWCASE (FILLS EMPTY SPACE) */
    .auth-perks-container {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px dashed #E2E8F0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .perks-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }

    .perks-line {
      flex: 1;
      height: 1px;
      background: #E2E8F0;
    }

    .perks-badge {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      background: #F8FAFC;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .star-gold {
      color: #F59E0B;
    }

    .perks-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .perk-card {
      display: flex;
      align-items: center;
      gap: 9px;
      background: #F8FAFC;
      border: 1px solid #F1F5F9;
      border-radius: 12px;
      padding: 10px;
      transition: all 0.2s ease;

      &:hover {
        background: #FFFFFF;
        border-color: #E2E8F0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        transform: translateY(-1px);
      }
    }

    .perk-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;

      &.gold-glow {
        background: #FEF3C7;
      }
      &.purple-glow {
        background: #F3E8FF;
      }
      &.emerald-glow {
        background: #DCFCE7;
      }
      &.blue-glow {
        background: #E0F2FE;
      }
    }

    .perk-text {
      min-width: 0;
    }

    .perk-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 2px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .perk-desc {
      font-size: 10px;
      color: #64748B;
      margin: 0;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .trust-footer-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(180deg, #FAFAFA 0%, #F1F5F9 100%);
      border: 1px solid #E2E8F0;
      border-radius: 9999px;
      padding: 6px 14px;
      margin-top: 4px;
    }

    .tfp-left {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .star-rating {
      color: #F59E0B;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .tfp-rating-score {
      font-size: 11.5px;
      font-weight: 800;
      color: #0F172A;
    }

    .tfp-dot {
      color: #94A3B8;
      font-size: 10px;
    }

    .tfp-label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }

    /* ANIMATIONS */
    .animate-fade {
      animation: fadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .animate-shake {
      animation: shake 0.32s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes popIn {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AuthModalComponent {
  @Input() inlineMode = false;

  private authService = inject(AuthService);
  private cartService = inject(CartService);

  @ViewChildren('pinInput') pinInputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('regPinInput') regPinInputRefs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly step = signal<AuthStep>('phone');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  // Step 1
  phone = '';
  isPhoneFocused = false;

  // Step 2
  existingUserName = signal<string>('');
  pinDigits = ['', '', '', ''];

  // Step 3
  name = '';
  registerPinDigits = ['', '', '', ''];

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.phone = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = this.phone;
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  clearPhone(): void {
    this.phone = '';
    this.errorMessage.set('');
  }

  formatPhone(num: string): string {
    if (!num) return '';
    const clean = num.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return clean;
  }

  async checkPhone(): Promise<void> {
    const cleanPhone = this.phone.trim();
    if (cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
      this.errorMessage.set('Please enter a valid 10-digit mobile number');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const user = await this.authService.checkUser(cleanPhone);
      if (user) {
        // Existing user -> Ask for PIN
        this.existingUserName.set(user.name || 'User');
        this.pinDigits = ['', '', '', ''];
        this.step.set('pin');
        setTimeout(() => this.focusPinIndex(0), 150);
      } else {
        // New user -> Register with Name and PIN
        this.step.set('register');
        setTimeout(() => {
          const arr = this.regPinInputRefs?.toArray();
          if (arr && arr[0]) arr[0].nativeElement.focus();
        }, 150);
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Network error. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- PIN BOX HANDLERS ---
  onPinInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    this.pinDigits[index] = val ? val[val.length - 1] : '';

    if (val && index < 3) {
      this.focusPinIndex(index + 1);
    }

    if (this.getCompletePin().length === 4) {
      this.submitPinLogin();
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.pinDigits[index] && index > 0) {
      this.pinDigits[index - 1] = '';
      this.focusPinIndex(index - 1);
    }
  }

  private focusPinIndex(index: number): void {
    const arr = this.pinInputRefs?.toArray();
    if (arr && arr[index]) {
      arr[index].nativeElement.focus();
    }
  }

  getCompletePin(): string {
    return this.pinDigits.join('');
  }

  async submitPinLogin(): Promise<void> {
    const pin = this.getCompletePin();
    if (pin.length !== 4) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.authService.loginWithPin(this.phone, pin);
      this.successMessage.set('Logged in successfully!');
      setTimeout(() => this.close(), 600);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Invalid PIN');
      this.pinDigits = ['', '', '', ''];
      setTimeout(() => this.focusPinIndex(0), 100);
    } finally {
      this.isLoading.set(false);
    }
  }

  getRegisterPin(): string {
    return this.registerPinDigits.join('');
  }

  onRegPinInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    this.registerPinDigits[index] = val ? val[val.length - 1] : '';

    if (val && index < 3) {
      const arr = this.regPinInputRefs?.toArray();
      if (arr && arr[index + 1]) arr[index + 1].nativeElement.focus();
    }

    if (this.getRegisterPin().length === 4 && this.name.trim()) {
      this.submitRegister();
    }
  }

  onRegPinKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.registerPinDigits[index] && index > 0) {
      this.registerPinDigits[index - 1] = '';
      const arr = this.regPinInputRefs?.toArray();
      if (arr && arr[index - 1]) arr[index - 1].nativeElement.focus();
    }
  }

  resetToRegister(): void {
    this.errorMessage.set('');
    this.step.set('register');
    setTimeout(() => {
      const arr = this.regPinInputRefs?.toArray();
      if (arr && arr[0]) arr[0].nativeElement.focus();
    }, 150);
  }

  async submitRegister(): Promise<void> {
    if (!this.name.trim()) {
      this.errorMessage.set('Please enter your full name');
      return;
    }
    const pin = this.getRegisterPin();
    if (pin.length !== 4) {
      this.errorMessage.set('Please set a 4-digit numeric PIN');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.authService.registerUser({
        phone: this.phone,
        name: this.name,
        pin: pin
      });

      this.successMessage.set('Account created successfully!');
      setTimeout(() => this.close(), 600);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Failed to create account');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleBack(): void {
    if (this.step() !== 'phone') {
      this.step.set('phone');
      this.errorMessage.set('');
    } else {
      this.close();
    }
  }

  close(): void {
    this.authService.closeAuthModal();
    if (this.inlineMode) {
      this.cartService.closeDrawer();
    }
  }
}

