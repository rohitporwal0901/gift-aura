import { Component, inject, signal, ViewChildren, QueryList, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

type AuthStep = 'phone' | 'pin' | 'register';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="inlineMode ? 'auth-inline' : 'auth-backdrop'" (click)="!inlineMode && close()">
      <div [class]="inlineMode ? 'auth-inline-sheet' : 'auth-sheet'" (click)="$event.stopPropagation()">
        
        <!-- DRAG HANDLE -->
        <div class="sheet-handle"></div>

        <!-- HEADER -->
        <div class="auth-header" *ngIf="!inlineMode">
          <div class="brand-pill">
            <svg viewBox="0 0 160 46" fill="none" xmlns="http://www.w3.org/2000/svg" height="38" width="auto">
              <g transform="translate(0, 2)">
                <path d="M16 7 Q20 3 24 7" stroke="#D4A017" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                <path d="M24 7 Q28 3 32 7" stroke="#D4A017" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                <circle cx="24" cy="7" r="1.8" fill="#D4A017"/>
                <rect x="11" y="8" width="26" height="6" rx="1.5" fill="#D4A017"/>
                <rect x="23" y="8" width="2.8" height="6" fill="#B8860B"/>
                <rect x="12" y="15" width="24" height="17" rx="1.5" fill="#111111"/>
                <rect x="23" y="15" width="2.8" height="17" fill="#D4A017"/>
                <circle cx="9" cy="6" r="1" fill="#D4A017" opacity="0.7"/>
                <circle cx="39" cy="4" r="0.9" fill="#D4A017" opacity="0.6"/>
              </g>
              <text x="44" y="28" font-family="'Outfit', 'Arial Black', sans-serif" font-weight="900" font-size="21" fill="#111111" letter-spacing="-0.5">GIFT</text>
              <text x="90" y="28" font-family="'Outfit', 'Arial Black', sans-serif" font-weight="900" font-size="21" fill="#D4A017" letter-spacing="-0.5">AURA</text>
              <text x="44" y="39" font-family="'Outfit', Arial, sans-serif" font-weight="600" font-size="6.5" fill="#888888" letter-spacing="1.4">CUSTOM GIFTS &amp; PRINTING</text>
            </svg>
          </div>
          <button class="close-btn" (click)="close()" type="button" aria-label="Close">✕</button>
        </div>

        <!-- ERROR ALERT -->
        @if (errorMessage()) {
          <div class="error-banner animate-shake">
            <span class="err-icon">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- SUCCESS ALERT -->
        @if (successMessage()) {
          <div class="success-banner">
            <span class="succ-icon">✓</span>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <!-- STEP 1: ENTER PHONE NUMBER -->
        @if (step() === 'phone') {
          <div class="step-container animate-fade">
            <!-- LOGO (shown in inline/drawer mode) -->
            <div class="inline-logo-wrap" *ngIf="inlineMode">
              <svg viewBox="0 0 160 46" fill="none" xmlns="http://www.w3.org/2000/svg" height="44" width="auto">
                <g transform="translate(0, 2)">
                  <path d="M16 7 Q20 3 24 7" stroke="#D4A017" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                  <path d="M24 7 Q28 3 32 7" stroke="#D4A017" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                  <circle cx="24" cy="7" r="1.8" fill="#D4A017"/>
                  <rect x="11" y="8" width="26" height="6" rx="1.5" fill="#D4A017"/>
                  <rect x="23" y="8" width="2.8" height="6" fill="#B8860B"/>
                  <rect x="12" y="15" width="24" height="17" rx="1.5" fill="#111111"/>
                  <rect x="23" y="15" width="2.8" height="17" fill="#D4A017"/>
                  <circle cx="9" cy="6" r="1" fill="#D4A017" opacity="0.7"/>
                  <circle cx="39" cy="4" r="0.9" fill="#D4A017" opacity="0.6"/>
                </g>
                <text x="44" y="28" font-family="'Outfit', 'Arial Black', sans-serif" font-weight="900" font-size="21" fill="#111111" letter-spacing="-0.5">GIFT</text>
                <text x="90" y="28" font-family="'Outfit', 'Arial Black', sans-serif" font-weight="900" font-size="21" fill="#D4A017" letter-spacing="-0.5">AURA</text>
                <text x="44" y="39" font-family="'Outfit', Arial, sans-serif" font-weight="600" font-size="6.5" fill="#888888" letter-spacing="1.4">CUSTOM GIFTS &amp; PRINTING</text>
              </svg>
            </div>
            <div class="title-wrap">
              <h3 class="step-title">Welcome to GiftAura</h3>
              <p class="step-subtitle">Enter your 10-digit mobile number to continue</p>
            </div>

            <div class="input-group phone-group">
              <span class="country-code">+91</span>
              <input 
                type="tel" 
                class="phone-input" 
                placeholder="Enter Mobile Number" 
                [(ngModel)]="phone" 
                maxlength="10"
                (keyup.enter)="checkPhone()"
                autofocus
              />
            </div>

            <button 
              type="button" 
              class="primary-submit-btn" 
              [disabled]="phone.trim().length !== 10 || isLoading()"
              (click)="checkPhone()"
            >
              @if (isLoading()) {
                <div class="btn-spinner"></div>
              } @else {
                <span>Continue</span>
              }
            </button>

            <p class="terms-text">
              By continuing, you agree to GiftAura's 
              <span class="link-text">Terms of Service</span> & 
              <span class="link-text">Privacy Policy</span>
            </p>
          </div>
        }

        <!-- STEP 2: ENTER 4-DIGIT PIN (EXISTING USER) -->
        @if (step() === 'pin') {
          <div class="step-container animate-fade">
            <div class="title-wrap">
              <div class="phone-tag">
                <span>+91 {{ phone }}</span>
                <button class="edit-link" (click)="step.set('phone')">Change</button>
              </div>
              <h3 class="step-title">Enter 4-Digit Security PIN</h3>
              <p class="step-subtitle">Welcome back, <b>{{ existingUserName() }}</b>! Enter your PIN to continue</p>
            </div>

            <!-- PIN INPUT DIGITS -->
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
              } @else {
                <span>Login Securely</span>
              }
            </button>

            <div class="extra-actions">
              <button class="text-action-btn" (click)="resetToRegister()">Forgot PIN or new account?</button>
            </div>
          </div>
        }

        <!-- STEP 3: NEW USER REGISTRATION WITH ADDRESS & PIN -->
        @if (step() === 'register') {
          <div class="step-container animate-fade register-container">
            <div class="title-wrap">
              <div class="phone-tag">
                <span>+91 {{ phone }}</span>
                <button class="edit-link" (click)="step.set('phone')">Change</button>
              </div>
              <h3 class="step-title">Create Your Account</h3>
              <p class="step-subtitle">Set up your profile & delivery location</p>
            </div>

            <div class="form-fields">
              <!-- FULL NAME -->
              <div class="input-field-wrap">
                <label class="field-label">Your Full Name</label>
                <input 
                  type="text" 
                  class="text-input" 
                  placeholder="e.g. Rahul Sharma" 
                  [(ngModel)]="name"
                />
              </div>

              <!-- SET 4-DIGIT PIN -->
              <div class="input-field-wrap">
                <label class="field-label" style="margin-bottom: 12px; display: block;">Set 4-Digit Security PIN</label>
                <div class="pin-digits-wrap">
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
              </div>

            </div>

            <button 
              type="button" 
              class="primary-submit-btn" 
              [disabled]="!name.trim() || getRegisterPin().length !== 4 || isLoading()"
              (click)="submitRegister()"
            >
              @if (isLoading()) {
                <div class="btn-spinner"></div>
              } @else {
                <span>Save Profile & Start Ordering</span>
              }
            </button>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .auth-inline {
      width: 100%;
      height: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
    }

    .auth-inline-sheet {
      width: 100%;
      height: 100%;
      padding: 30px 24px;
      overflow-y: auto;
      background: #ffffff;
    }

    .inline-logo-wrap {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 20px;
      line-height: 0;
    }

    .auth-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2500;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    @media (min-width: 768px) {
      .auth-backdrop {
        align-items: center;
        padding: 20px;
      }
    }

    .auth-sheet {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 24px 24px 0 0;
      padding: 14px 22px 28px;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      max-height: 92vh;
      overflow-y: auto;
    }

    @media (min-width: 768px) {
      .auth-sheet {
        border-radius: 24px;
        padding: 24px 28px 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.22);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-handle {
      width: 36px;
      height: 4px;
      background: #E0E0E0;
      border-radius: 2px;
      margin: 0 auto 12px;
    }

    .auth-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 8px;
      line-height: 0;
    }

    .close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      color: #6B7280;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &:active { background: #E5E7EB; }
    }

    .title-wrap {
      margin-bottom: 20px;
    }

    .step-title {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 5px;
      letter-spacing: -0.3px;
    }

    .step-subtitle {
      font-size: 13px;
      color: #6B7280;
      margin: 0;
      line-height: 1.4;
    }

    .step-subtitle b {
      color: #111827;
    }

    .phone-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 10px;
    }

    .edit-link {
      background: transparent;
      border: none;
      color: #D4A017;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }

    /* PHONE INPUT */
    .phone-group {
      display: flex;
      align-items: center;
      border: 1.5px solid #D1D5DB;
      border-radius: 14px;
      background: #ffffff;
      padding: 0 14px;
      height: 52px;
      margin-bottom: 20px;
      transition: all 0.2s ease;
      &:focus-within {
        border-color: #D4A017;
        box-shadow: 0 0 0 4px rgba(212, 160, 23, 0.15);
      }
    }

    .country-code {
      font-size: 15px;
      font-weight: 700;
      color: #374151;
      padding-right: 12px;
      border-right: 1px solid #E5E7EB;
    }

    .phone-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 17px;
      font-weight: 700;
      color: #111827;
      padding-left: 12px;
      letter-spacing: 1px;
      font-family: inherit;
      &::placeholder {
        font-weight: 400;
        font-size: 14px;
        letter-spacing: 0;
        color: #9CA3AF;
      }
    }

    /* PIN INPUT BOXES (ZOMATO / SWIGGY STYLE) */
    .pin-digits-wrap {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 24px 0 26px;
    }

    .pin-box {
      width: 54px;
      height: 58px;
      border-radius: 14px;
      border: 2px solid #D1D5DB;
      background: #FAFAFA;
      font-size: 24px;
      font-weight: 800;
      text-align: center;
      color: #111827;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
      &:focus {
        border-color: #D4A017;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(212, 160, 23, 0.2);
        transform: scale(1.05);
      }
      &.filled {
        border-color: #D4A017;
        background: #FFFBEA;
      }
    }

    /* BUTTONS */
    .primary-submit-btn {
      width: 100%;
      height: 50px;
      background: linear-gradient(135deg, #D4A017 0%, #F0C040 100%);
      color: #111111;
      border: none;
      border-radius: 14px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(212, 160, 23, 0.4);
      transition: all 0.2s ease;
      &:hover {
        background: linear-gradient(135deg, #C49010 0%, #D4A017 100%);
        box-shadow: 0 6px 20px rgba(212, 160, 23, 0.5);
        transform: translateY(-1px);
      }
      &:active {
        transform: scale(0.98);
        background: #B8860B;
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
    }

    .btn-spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid #111111;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .terms-text {
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
      margin: 16px 0 0;
      line-height: 1.5;
    }

    .link-text {
      color: #D4A017;
      font-weight: 600;
      cursor: pointer;
    }

    .extra-actions {
      margin-top: 16px;
      text-align: center;
    }

    .text-action-btn {
      background: transparent;
      border: none;
      color: #D4A017;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 6px;
      &:hover { text-decoration: underline; }
    }

    /* REGISTER FORM */
    .register-container .form-fields {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 20px;
    }

    .input-field-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 700;
      color: #374151;
    }

    .text-input {
      width: 100%;
      height: 46px;
      border-radius: 12px;
      border: 1.5px solid #D1D5DB;
      padding: 0 14px;
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
      font-family: inherit;
      &:focus {
        border-color: #D4A017;
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.15);
      }
    }

    .pin-set-input {
      font-size: 18px;
      letter-spacing: 4px;
      font-weight: 700;
    }

    /* ALERTS */
    .error-banner {
      background: #FEE2E2;
      border: 1px solid #FCA5A5;
      color: #991B1B;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }

    .success-banner {
      background: #D1FAE5;
      border: 1px solid #6EE7B7;
      color: #065F46;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }

    .animate-shake {
      animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
  `]
})
export class AuthModalComponent {
  @Input() inlineMode = false;

  private authService = inject(AuthService);

  @ViewChildren('pinInput') pinInputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('regPinInput') regPinInputRefs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly step = signal<AuthStep>('phone');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  // Step 1
  phone = '';

  // Step 2
  existingUserName = signal<string>('');
  pinDigits = ['', '', '', ''];

  // Step 3
  name = '';
  registerPinDigits = ['', '', '', ''];

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
    const arr = this.pinInputRefs.toArray();
    if (arr[index]) {
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
      const arr = this.regPinInputRefs.toArray();
      if (arr[index + 1]) arr[index + 1].nativeElement.focus();
    }

    if (this.getRegisterPin().length === 4 && this.name.trim()) {
      this.submitRegister();
    }
  }

  onRegPinKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.registerPinDigits[index] && index > 0) {
      this.registerPinDigits[index - 1] = '';
      const arr = this.regPinInputRefs.toArray();
      if (arr[index - 1]) arr[index - 1].nativeElement.focus();
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

  close(): void {
    this.authService.closeAuthModal();
  }
}
