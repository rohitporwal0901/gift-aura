import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SnackbarComponent } from '../../shared/snackbar/snackbar.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SnackbarComponent],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  snackbar = inject(SnackbarService);

  email = 'admin@fruitchat.com';
  password = '123456';

  isLoading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  togglePassword() { this.showPassword.update(v => !v); }

  fillDemoCredentials() {
    this.email = 'admin@fruitchat.com';
    this.password = '123456';
    this.errorMsg.set('');
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please enter email and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    // Quick admin credentials (just like Khandelwal cards)
    if (
      (this.email.trim().toLowerCase() === 'admin@fruitchat.com' || this.email.trim().toLowerCase() === 'fruitchat.admin@gmail.com') &&
      (this.password === '123456' || this.password === 'admin' || this.password === 'admin123')
    ) {
      setTimeout(() => {
        localStorage.setItem('admin_logged_in', 'true');
        this.snackbar.show('Logged in successfully!', 'success');
        this.router.navigate(['/admin/dashboard']);
        this.isLoading.set(false);
      }, 500);
      return;
    }

    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      localStorage.setItem('admin_logged_in', 'true');
      this.snackbar.show('Logged in successfully!', 'success');
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.message || 'Login failed.';
      this.errorMsg.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
