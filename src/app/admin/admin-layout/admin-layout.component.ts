import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { DataService } from '../../core/services/data.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { SnackbarComponent } from '../../shared/snackbar/snackbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, SnackbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  private auth = inject(Auth);
  router = inject(Router);
  dataService = inject(DataService);

  currentDate = new Date();
  isLogoutModalOpen = false;
  isSidebarCollapsed = signal(false);
  isMobileDrawerOpen = signal(false);

  pendingOrdersCount = computed(() =>
    this.dataService.orders().filter(o => o.status === 'pending').length
  );

  toggleSidebar() { this.isSidebarCollapsed.update(v => !v); }

  toggleMobileDrawer() { this.isMobileDrawerOpen.update(v => !v); }
  closeMobileDrawer() { this.isMobileDrawerOpen.set(false); }

  promptLogout() {
    this.closeMobileDrawer();
    this.isLogoutModalOpen = true;
  }
  cancelLogout() { this.isLogoutModalOpen = false; }

  async confirmLogout() {
    this.isLogoutModalOpen = false;
    localStorage.removeItem('admin_logged_in');
    await signOut(this.auth).catch(() => {});
    this.router.navigate(['/admin/login']);
  }

  isActiveRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}
