import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Category } from '../../core/models/admin.model';
import { SideDrawerComponent } from '../../shared/side-drawer/side-drawer.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { SnackbarService } from '../../core/services/snackbar.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, SideDrawerComponent, ConfirmationModalComponent],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent {
  dataService = inject(DataService);
  storage = inject(Storage);
  snackbar = inject(SnackbarService);

  categories = this.dataService.categories;

  isDrawerOpen   = signal(false);
  isEditing      = signal(false);
  isDeleteModal  = signal(false);
  catToDelete    = signal<string | null>(null);
  isSaving       = signal(false);
  isUploading    = signal(false);
  uploadProgress = signal(0);

  currentCat: Partial<Category> = this.getEmpty();

  getEmpty() {
    return { name: '', description: '', image: '', status: 'active' as const };
  }

  productCountFor(catId: string): number {
    return this.dataService.products().filter(p => p.categoryId === catId).length;
  }

  openAdd() {
    this.isEditing.set(false);
    this.currentCat = this.getEmpty();
    this.isDrawerOpen.set(true);
  }

  openEdit(cat: Category) {
    this.isEditing.set(true);
    this.currentCat = { ...cat };
    this.isDrawerOpen.set(true);
  }

  close() { this.isDrawerOpen.set(false); }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true); this.uploadProgress.set(0);
    const storRef = ref(this.storage, `categories/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storRef, file);
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed',
        snap => this.uploadProgress.set(Math.round((snap.bytesTransferred/snap.totalBytes)*100)),
        reject,
        async () => {
          this.currentCat.image = await getDownloadURL(task.snapshot.ref);
          resolve();
        }
      );
    });
    this.isUploading.set(false);
    event.target.value = '';
  }

  async save(form: any) {
    if (form.invalid) {
      this.snackbar.show('Fill required fields', 'error');
      return;
    }
    if (!this.currentCat.image) {
      this.currentCat.image = 'assets/images/mix-fruit-chaat.jpg';
    }
    this.isSaving.set(true);
    try {
      if (this.isEditing() && 'id' in this.currentCat) {
        await this.dataService.updateCategory((this.currentCat as any).id, this.currentCat);
        this.snackbar.show('Category updated!', 'success');
      } else {
        await this.dataService.addCategory(this.currentCat as any);
        this.snackbar.show('Category added!', 'success');
      }
      this.close();
    } catch { this.snackbar.show('Failed to save', 'error'); }
    finally { this.isSaving.set(false); }
  }

  promptDelete(id: string) { this.catToDelete.set(id); this.isDeleteModal.set(true); }
  cancelDelete() { this.isDeleteModal.set(false); this.catToDelete.set(null); }
  async confirmDelete() {
    const id = this.catToDelete();
    if (id) { await this.dataService.deleteCategory(id); this.snackbar.show('Category deleted', 'success'); }
    this.isDeleteModal.set(false); this.catToDelete.set(null);
  }
}
