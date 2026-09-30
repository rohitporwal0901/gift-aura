import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { ComboCard } from '../../core/models/admin.model';
import { SideDrawerComponent } from '../../shared/side-drawer/side-drawer.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { SnackbarService } from '../../core/services/snackbar.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-admin-combo-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, SideDrawerComponent, ConfirmationModalComponent],
  templateUrl: './admin-combo-cards.component.html',
  styleUrls: ['./admin-combo-cards.component.css']
})
export class AdminComboCardsComponent {
  dataService = inject(DataService);
  storage     = inject(Storage);
  snackbar    = inject(SnackbarService);

  comboCards = this.dataService.comboCards;

  isDrawerOpen  = signal(false);
  isEditing     = signal(false);
  isDeleteModal = signal(false);
  cardToDelete  = signal<string | null>(null);
  isSaving      = signal(false);
  isUploading   = signal(false);
  uploadProgress = signal(0);

  // Preset gradient options matching home page style
  gradientPresets = [
    { label: 'Forest Green',  value: 'linear-gradient(125deg, #0A3D18 0%, #15662B 50%, #239441 100%)' },
    { label: 'Burnt Orange',  value: 'linear-gradient(125deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%)' },
    { label: 'Deep Red',      value: 'linear-gradient(125deg, #7F1D1D 0%, #B91C1C 50%, #DC2626 100%)' },
    { label: 'Teal',          value: 'linear-gradient(125deg, #042F2E 0%, #0F766E 50%, #14B8A6 100%)' },
    { label: 'Royal Purple',  value: 'linear-gradient(125deg, #3B0764 0%, #7E22CE 50%, #A855F7 100%)' },
    { label: 'Ocean Blue',    value: 'linear-gradient(125deg, #0C2340 0%, #1D4ED8 50%, #3B82F6 100%)' },
    { label: 'Golden Amber',  value: 'linear-gradient(125deg, #78350F 0%, #D97706 50%, #FCD34D 100%)' },
    { label: 'Rose Pink',     value: 'linear-gradient(125deg, #881337 0%, #E11D48 50%, #FB7185 100%)' },
  ];

  currentCard: Partial<ComboCard> = this.getEmpty();

  getEmpty(): Partial<ComboCard> {
    return {
      tag: '',
      title: '',
      price: 0,
      originalPrice: 0,
      btnText: 'Order Combo',
      link: '/menu',
      image: '',
      bg: this.gradientPresets[0].value,
      status: 'active',
      order: (this.comboCards().length + 1),
    };
  }

  get savings(): number {
    return Math.max(0, (this.currentCard.originalPrice || 0) - (this.currentCard.price || 0));
  }

  openAdd() {
    this.isEditing.set(false);
    this.currentCard = this.getEmpty();
    this.isDrawerOpen.set(true);
  }

  openEdit(card: ComboCard) {
    this.isEditing.set(true);
    this.currentCard = { ...card };
    this.isDrawerOpen.set(true);
  }

  close() { this.isDrawerOpen.set(false); }

  // ── Image Upload (Firebase Storage) ──
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true); this.uploadProgress.set(0);
    const storRef = ref(this.storage, `combo_cards/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storRef, file);
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed',
        snap => this.uploadProgress.set(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => {
          this.currentCard.image = await getDownloadURL(task.snapshot.ref);
          resolve();
        }
      );
    });
    this.isUploading.set(false);
    event.target.value = '';
  }

  // ── Save ──
  async save(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(k => form.controls[k].markAsTouched());
      return;
    }
    // Default image agar koi nahi diya
    if (!this.currentCard.image) {
      this.currentCard.image = 'assets/images/placeholder-product.png';
    }
    this.isSaving.set(true);
    try {
      const data: any = {
        ...this.currentCard,
        price: Number(this.currentCard.price || 0),
        originalPrice: Number(this.currentCard.originalPrice || 0),
        order: Number(this.currentCard.order || 1),
      };
      if (this.isEditing() && 'id' in this.currentCard) {
        await this.dataService.updateComboCard((this.currentCard as any).id, data);
        this.snackbar.show('Combo card updated!', 'success');
      } else {
        await this.dataService.addComboCard(data as any);
        this.snackbar.show('Combo card added!', 'success');
      }
      this.close();
    } catch {
      this.snackbar.show('Failed to save combo card', 'error');
    } finally { this.isSaving.set(false); }
  }

  // ── Delete ──
  promptDelete(id: string) { this.cardToDelete.set(id); this.isDeleteModal.set(true); }
  cancelDelete() { this.isDeleteModal.set(false); this.cardToDelete.set(null); }
  async confirmDelete() {
    const id = this.cardToDelete();
    if (id) {
      await this.dataService.deleteComboCard(id);
      this.snackbar.show('Combo card deleted', 'success');
    }
    this.isDeleteModal.set(false); this.cardToDelete.set(null);
  }

  preventInvalid(e: KeyboardEvent) {
    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
  }

  selectGradient(value: string) { this.currentCard.bg = value; }
}
