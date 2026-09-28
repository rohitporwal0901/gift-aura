import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { MapPickerComponent } from './shared/map-picker/map-picker.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MapPickerComponent],
  template: `
    @if (!isAuthRoute()) {
      <app-navbar></app-navbar>
    }
    <main class="main-content" [class.no-nav]="isAuthRoute()">
      <router-outlet></router-outlet>
    </main>

    @if (authService.showMapPicker()) {
      <app-map-picker></app-map-picker>
    }
  `,
  styles: [`
    .main-content {
      padding-bottom: 80px;
    }
    .main-content.no-nav {
      padding: 0 !important;
    }
    @media (min-width: 768px) {
      .main-content {
        padding-bottom: 0;
        padding-top: 72px;
      }
      .main-content.no-nav {
        padding-top: 0 !important;
      }
    }
  `]
})
export class App {
  title = 'gift-aura';
  private router = inject(Router);
  authService = inject(AuthService);
  readonly isAuthRoute = signal<boolean>(false);

  constructor() {
    // Use window.location.pathname for IMMEDIATE correct value on page load.
    // router.url is '' initially which causes navbar to flash for one frame.
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
      cleanUrl.startsWith('/admin') ||
      cleanUrl.startsWith('/checkout')
    );
  }
}
