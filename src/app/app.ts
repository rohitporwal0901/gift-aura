import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { WhatsappWidgetComponent } from './shared/whatsapp-widget/whatsapp-widget.component';
import { CartDrawerComponent } from './shared/cart-drawer/cart-drawer.component';
import { MapPickerComponent } from './shared/map-picker/map-picker.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    WhatsappWidgetComponent,
    CartDrawerComponent,
    MapPickerComponent
  ],
  template: `
    @if (!isAuthRoute()) {
      <app-navbar></app-navbar>
    }

    <main class="gl-main-wrapper" [class.no-nav]="isAuthRoute()">
      <router-outlet></router-outlet>
    </main>

    @if (!isAuthRoute()) {
      <app-footer></app-footer>
      <app-whatsapp-widget></app-whatsapp-widget>
      <app-cart-drawer></app-cart-drawer>
    }

    @if (authService.showMapPicker()) {
      <app-map-picker></app-map-picker>
    }
  `,
  styles: [`
    .gl-main-wrapper {
      min-height: calc(100vh - 120px);
    }
    .gl-main-wrapper.no-nav {
      padding: 0 !important;
    }
  `]
})
export class App {
  title = 'GiftAura';
  private router = inject(Router);
  authService = inject(AuthService);
  readonly isAuthRoute = signal<boolean>(false);

  constructor() {
    this.checkCurrentRoute(window.location.pathname);

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.checkCurrentRoute(e.urlAfterRedirects || e.url);
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }

  private checkCurrentRoute(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    this.isAuthRoute.set(
      cleanUrl.startsWith('/auth') ||
      cleanUrl.startsWith('/admin')
    );
  }
}
