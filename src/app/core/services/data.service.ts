import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  getDoc,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from '@angular/fire/firestore';
import { AdminProduct, Category, AdminOrder, Transaction, HomeSlide, OfferCard, ComboCard } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  firestore = inject(Firestore);

  // ── Signals (live Firestore data) ────────────────────────
  products   = signal<AdminProduct[]>([]);
  categories = signal<Category[]>([]);
  orders     = signal<AdminOrder[]>([]);
  transactions = signal<Transaction[]>([]);
  homeSlides = signal<HomeSlide[]>([]);
  comboCards = signal<ComboCard[]>([]);
  offerCard  = signal<OfferCard>({
    heading: 'Special Corporate Welcome Offer',
    subtext: 'Valid on corporate gift orders above ₹999',
    amount: 100,
    minOrderAmount: 999,
    code: 'GIFT100',
    validText: 'Valid on orders above ₹999',
    isActive: true
  });
  isOfferCardLoading = signal<boolean>(true);

  constructor() {
    this.listenProducts();
    this.listenCategories();
    this.listenOrders();
    this.listenTransactions();
    this.listenHomeSlides();
    this.listenComboCards();
    this.listenOfferCard();
  }

  // ── Listeners ─────────────────────────────────────────────

  private listenProducts() {
    const ref = collection(this.firestore, 'products');
    const q = query(ref, orderBy('createdAt', 'desc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminProduct));
      this.products.set(data);
    }, (err) => {
      console.warn('Error listening products:', err);
    });
  }

  private listenCategories() {
    const ref = collection(this.firestore, 'categories');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      this.categories.set(data);
    }, (err) => {
      console.warn('Error listening categories:', err);
    });
  }

  private listenOrders() {
    const ref = collection(this.firestore, 'orders');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminOrder));
      data.sort((a, b) => {
        const timeA = new Date(a.placedAt || (a as any).createdAt || 0).getTime();
        const timeB = new Date(b.placedAt || (b as any).createdAt || 0).getTime();
        return timeB - timeA;
      });
      this.orders.set(data);
    }, (err) => {
      console.warn('Error listening orders:', err);
    });
  }

  private listenTransactions() {
    const ref = collection(this.firestore, 'transactions');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      data.sort((a, b) => {
        const timeA = new Date(a.date || (a as any).createdAt || 0).getTime();
        const timeB = new Date(b.date || (b as any).createdAt || 0).getTime();
        return timeB - timeA;
      });
      this.transactions.set(data);
    }, (err) => {
      console.warn('Error listening transactions:', err);
    });
  }

  private listenHomeSlides() {
    const ref = collection(this.firestore, 'home_slides');
    const q = query(ref, orderBy('order', 'asc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeSlide));
      this.homeSlides.set(data);
    }, (err) => {
      console.warn('Error listening home slides:', err);
    });
  }

  private listenComboCards() {
    const ref = collection(this.firestore, 'combo_cards');
    const q = query(ref, orderBy('order', 'asc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComboCard));
      this.comboCards.set(data);
    }, (err) => {
      console.warn('Error listening combo cards:', err);
    });
  }

  private listenOfferCard() {
    const ref = doc(this.firestore, 'settings', 'offerCard');
    onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        this.offerCard.set({
          heading: d.heading || 'Special Corporate Welcome Offer',
          subtext: d.subtext || 'Valid on corporate gift orders above ₹999',
          amount: d.amount ?? 100,
          minOrderAmount: d.minOrderAmount ?? 999,
          code: (d.code || 'GIFT100').toUpperCase(),
          validText: d.validText || `Valid on orders above ₹${d.minOrderAmount ?? 999}`,
          isActive: d.isActive !== false
        });
      }
      this.isOfferCardLoading.set(false);
    }, (err) => {
      console.warn('Error listening offer card:', err);
      this.isOfferCardLoading.set(false);
    });
  }

  // ── Products CRUD ──────────────────────────────────────────

  async addProduct(product: Omit<AdminProduct, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'products');
    await addDoc(ref, { ...product, createdAt: new Date().toISOString() });
  }

  async updateProduct(id: string, data: Partial<AdminProduct>): Promise<void> {
    const ref = doc(this.firestore, 'products', id);
    await updateDoc(ref, data as any);
  }

  async deleteProduct(id: string): Promise<void> {
    const ref = doc(this.firestore, 'products', id);
    await deleteDoc(ref);
  }

  // ── Categories CRUD ────────────────────────────────────────

  async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'categories');
    await addDoc(ref, { ...category, createdAt: new Date().toISOString() });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const ref = doc(this.firestore, 'categories', id);
    await updateDoc(ref, data as any);
  }

  async deleteCategory(id: string): Promise<void> {
    const ref = doc(this.firestore, 'categories', id);
    await deleteDoc(ref);
  }

  getCategoryName(id: string): string {
    const cat = this.categories().find(c => c.id === id);
    return cat ? cat.name : (id || '—');
  }

  // Helper to remove undefined fields recursively so Firestore doesn't reject writes
  private removeUndefined<T>(obj: T): T {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefined(item)) as unknown as T;
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = this.removeUndefined(value);
      }
    }
    return result;
  }

  // ── Orders ─────────────────────────────────────────────────

  async addOrder(order: Omit<AdminOrder, 'id'>): Promise<string> {
    const ref = collection(this.firestore, 'orders');
    const cleaned = this.removeUndefined(order);
    const docRef = await addDoc(ref, cleaned);
    return docRef.id;
  }

  async updateOrderStatus(id: string, status: AdminOrder['status'], reason?: string): Promise<void> {
    const ref = doc(this.firestore, 'orders', id);
    const data: any = { status };
    if (reason) data.cancellationReason = reason;
    await updateDoc(ref, data);
  }

  // ── Transactions ───────────────────────────────────────────

  async addTransaction(txn: Omit<Transaction, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'transactions');
    const cleaned = this.removeUndefined(txn);
    await addDoc(ref, cleaned);
  }

  // ── Home Slides ────────────────────────────────────

  async addHomeSlide(slide: Omit<HomeSlide, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'home_slides');
    await addDoc(ref, slide);
  }

  async updateHomeSlide(id: string, data: Partial<HomeSlide>): Promise<void> {
    const ref = doc(this.firestore, 'home_slides', id);
    await updateDoc(ref, data as any);
  }

  async deleteHomeSlide(id: string): Promise<void> {
    const ref = doc(this.firestore, 'home_slides', id);
    await deleteDoc(ref);
  }

  // ── Offer Card ─────────────────────────────────────────────

  async updateOfferCard(data: Partial<OfferCard>): Promise<void> {
    const ref = doc(this.firestore, 'settings', 'offerCard');
    await setDoc(ref, data, { merge: true });
  }

  // ── Combo Cards ────────────────────────────────────────────

  async addComboCard(combo: Omit<ComboCard, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'combo_cards');
    await addDoc(ref, { ...combo, createdAt: new Date().toISOString() });
  }

  async updateComboCard(id: string, data: Partial<ComboCard>): Promise<void> {
    const ref = doc(this.firestore, 'combo_cards', id);
    await updateDoc(ref, data as any);
  }

  async deleteComboCard(id: string): Promise<void> {
    const ref = doc(this.firestore, 'combo_cards', id);
    await deleteDoc(ref);
  }

  // ── Live Delivery Tracking ───────────────────────────────

  async updateLiveDelivery(orderId: string, lat: number, lng: number): Promise<void> {
    const ref = doc(this.firestore, 'live_deliveries', orderId);
    await setDoc(ref, { lat, lng, updatedAt: new Date().toISOString() }, { merge: true });
  }

  listenToLiveDelivery(orderId: string, callback: (data: {lat: number, lng: number} | null) => void): () => void {
    const ref = doc(this.firestore, 'live_deliveries', orderId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as {lat: number, lng: number});
      } else {
        callback(null);
      }
    });
  }

  // ── Coupon Usage Tracking ─────────────────────────────────

  async markCouponUsed(userId: string | undefined, code: string): Promise<void> {
    const cleanCode = code?.trim().toUpperCase();
    if (!cleanCode || !userId) return;

    try {
      const userRef = doc(this.firestore, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const currentCoupons: string[] = snap.data()['usedCoupons'] || [];
        if (!currentCoupons.includes(cleanCode)) {
          await updateDoc(userRef, {
            usedCoupons: [...currentCoupons, cleanCode]
          });
        }
      }
    } catch (err) {
      console.warn('Could not update usedCoupons in user doc:', err);
    }
  }

  // Coupon usage: User can use a coupon once per order (enforced per order via cart)
  isCouponUsed(_userId: string | undefined, _phone: string | undefined, _userDoc: any, _code: string): boolean {
    return false;
  }
}
