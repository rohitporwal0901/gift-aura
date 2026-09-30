import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AdminProduct } from '../../core/models/admin.model';
import { SideDrawerComponent } from '../../shared/side-drawer/side-drawer.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { SnackbarService } from '../../core/services/snackbar.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SideDrawerComponent, ConfirmationModalComponent],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  dataService = inject(DataService);
  storage = inject(Storage);
  snackbar = inject(SnackbarService);

  products = this.dataService.products;
  categories = this.dataService.categories;

  isLoading = signal(true);
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  isPaginating = signal(false);

  isDrawerOpen = signal(false);
  isEditing = signal(false);
  isDeleteModal = signal(false);
  productToDelete = signal<string | null>(null);
  isSaving = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);

  dupSkuError = signal('');

  newProduct: Partial<AdminProduct> & { images: string[] } = this.getEmpty();

  ngOnInit() { setTimeout(() => this.isLoading.set(false), 1200); }

  getEmpty() {
    return {
      name: '', categoryId: '', description: '',
      price: 0, originalPrice: undefined as any, stock: 100,
      status: 'active' as const, images: [],
      isBestseller: false,
      minQty: 1, offerText: '',
      rating: 4.8, ratingCount: 15
    };
  }

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.products();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
    return list;
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()) || 1);

  onSearch(val: string) { this.searchQuery.set(val); this.currentPage.set(1); }
  goToPage(p: number) { this.currentPage.set(p); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

  getCategoryName(id: string) { return this.dataService.getCategoryName(id); }

  openAddDrawer() {
    this.isEditing.set(false);
    this.newProduct = this.getEmpty();
    this.dupSkuError.set('');
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(p: AdminProduct) {
    this.isEditing.set(true);
    this.newProduct = { ...JSON.parse(JSON.stringify(p)), images: [...(p.images || [])] };
    this.dupSkuError.set('');
    this.isDrawerOpen.set(true);
  }

  closeDrawer() { this.isDrawerOpen.set(false); }

  checkDupSku() {
    const sku = (this.newProduct.sku || '').trim().toLowerCase();
    if (!sku) { this.dupSkuError.set(''); return; }
    const curId = (this.newProduct as any).id ?? null;
    const exists = this.products().some(p => (p.sku || '').toLowerCase() === sku && p.id !== curId);
    this.dupSkuError.set(exists ? `SKU "${this.newProduct.sku}" already exists!` : '');
  }

  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files?.length) return;
    this.isUploading.set(true); this.uploadProgress.set(0);
    const total = files.length; let done = 0;
    const promises = Array.from(files).map(file => {
      const storRef = ref(this.storage, `products/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storRef, file);
      return new Promise<void>((resolve, reject) => {
        task.on('state_changed', null,
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            this.newProduct.images.push(url);
            done++; this.uploadProgress.set(Math.round((done / total) * 100));
            resolve();
          }
        );
      });
    });
    await Promise.all(promises);
    this.isUploading.set(false);
    event.target.value = '';
  }

  removeImage(i: number) { this.newProduct.images.splice(i, 1); }

  async saveProduct(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(k => form.controls[k].markAsTouched());
      return;
    }
    // Agar koi image nahi upload ki, default placeholder use karo
    if (!this.newProduct.images.length) {
      this.newProduct.images = ['assets/images/gift-box.jpg'];
    }
    this.isSaving.set(true);
    try {
      const data: any = {
        ...this.newProduct,
        sku: this.newProduct.sku || ('GA-' + Math.floor(1000 + Math.random() * 9000)),
        price: Number(this.newProduct.price || 0),
        originalPrice: this.newProduct.originalPrice ? Number(this.newProduct.originalPrice) : null,
        stock: Number(this.newProduct.stock ?? 100),
        minQty: Number(this.newProduct.minQty || 1),
        offerText: this.newProduct.offerText?.trim() || null,
        isBestseller: Boolean(this.newProduct.isBestseller)
      };
      if (this.isEditing() && 'id' in this.newProduct) {
        await this.dataService.updateProduct((this.newProduct as any).id, data);
        this.snackbar.show('Product updated!', 'success');
      } else {
        await this.dataService.addProduct(data as any);
        this.snackbar.show('Product added!', 'success');
        this.currentPage.set(1);
      }
      this.closeDrawer();
    } catch (e) {
      this.snackbar.show('Failed to save product', 'error');
    } finally { this.isSaving.set(false); }
  }

  promptDelete(id: string) { this.productToDelete.set(id); this.isDeleteModal.set(true); }
  cancelDelete() { this.isDeleteModal.set(false); this.productToDelete.set(null); }
  async confirmDelete() {
    const id = this.productToDelete();
    if (id) { await this.dataService.deleteProduct(id); this.snackbar.show('Product deleted', 'success'); }
    this.isDeleteModal.set(false); this.productToDelete.set(null);
  }

  preventInvalid(e: KeyboardEvent) {
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
  }
}
