import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};
