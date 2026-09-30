import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AdminOrder } from '../../core/models/admin.model';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent {
  dataService = inject(DataService);
  snackbar = inject(SnackbarService);

  statusFilter = signal('all');
  selectedOrder = signal<AdminOrder | null>(null);
  isUpdating = signal<string | null>(null);

  getTodayStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectedDate = signal<string>(this.getTodayStr());

  private getOrderDateStr(order: AdminOrder): string | null {
    const raw = order.placedAt || (order as any).createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  dateFilteredOrders = computed(() => {
    const orders = this.dataService.orders();
    const date = this.selectedDate();
    if (!date) return orders;
    return orders.filter(o => this.getOrderDateStr(o) === date);
  });

  filteredOrders = computed(() => {
    const f = this.statusFilter();
    const orders = this.dateFilteredOrders();
    return f === 'all' ? orders : orders.filter(o => o.status === f);
  });

  orderStatuses: AdminOrder['status'][] = ['pending','confirmed','preparing','out-for-delivery','delivered','cancelled'];

  setFilter(f: string) { this.statusFilter.set(f); }

  onDateChange(newDate: string) {
    this.selectedDate.set(newDate || '');
    if (this.selectedOrder()) {
      const exists = this.dateFilteredOrders().some(o => o.id === this.selectedOrder()?.id);
      if (!exists) {
        this.selectedOrder.set(null);
      }
    }
  }

  setToday() {
    this.onDateChange(this.getTodayStr());
  }

  clearDate() {
    this.onDateChange('');
  }

  openPicker(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && typeof (target as any).showPicker === 'function') {
      try {
        (target as any).showPicker();
      } catch {
        // Fallback: browser handles native interaction
      }
    }
  }

  isTodaySelected = computed(() => {
    return this.selectedDate() === this.getTodayStr();
  });

  formattedSelectedDate = computed(() => {
    const dStr = this.selectedDate();
    if (!dStr) return '';
    const [y, m, d] = dStr.split('-').map(Number);
    if (!y || !m || !d) return dStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  viewOrder(o: AdminOrder) { this.selectedOrder.set(o); }
  closeDetail() { this.selectedOrder.set(null); }

  async updateStatus(orderId: string, status: AdminOrder['status']) {
    this.isUpdating.set(orderId);
    try {
      await this.dataService.updateOrderStatus(orderId, status);
      this.snackbar.show(`Order marked as ${status}`, 'success');
      if (this.selectedOrder()?.id === orderId) {
        const updated = this.dataService.orders().find(o => o.id === orderId);
        this.selectedOrder.set(updated || null);
      }
    } catch { this.snackbar.show('Failed to update status', 'error'); }
    finally { this.isUpdating.set(null); }
  }

  async copyOrderId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      this.snackbar.show('Order ID copied to clipboard', 'success');
    } catch {
      this.snackbar.show('Failed to copy Order ID', 'error');
    }
  }

  getStatusClass(s: string) {
    const map: any = { pending:'status-pending', confirmed:'status-confirmed', preparing:'status-preparing', 'out-for-delivery':'status-delivery', delivered:'status-delivered', cancelled:'status-cancelled' };
    return map[s] || '';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'preparing': return 'Processing';
      case 'out-for-delivery': return 'Shipped';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  }

  statusCounts = computed(() => {
    const orders = this.dateFilteredOrders();
    const c: any = { all: orders.length };
    this.orderStatuses.forEach(s => c[s] = orders.filter(o => o.status === s).length);
    return c;
  });
}
