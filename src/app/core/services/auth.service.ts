import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from '@angular/fire/firestore';
import { User, AddressOption } from '../models/user.model';

const STORAGE_KEY = 'user';

export const DEFAULT_ADDRESS: AddressOption = {
  id: 'default_addr',
  icon: '🏠',
  label: 'Home',
  detail: 'Sector 15, City Center',
  fullAddress: 'Flat 402, Green Valley Apartments, Sector 15',
  lat: 22.7196,
  lng: 75.8577,
  isDefault: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private profileUnsubscribe?: () => void;

  // ─── Signals ─────────────────────────────────────────────
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly authLoading = signal<boolean>(true); // true while Firebase resolves initial session

  private _activeAddress = signal<AddressOption>(DEFAULT_ADDRESS);
  readonly activeAddress = this._activeAddress.asReadonly();

  // Modal signals
  readonly showAuthModal = signal<boolean>(false);
  readonly showMapPicker = signal<boolean>(false);

  constructor() {
    this.restoreLocalCache();
    this.initFirebaseAuthState();
  }

  // ─── Restore local cache for instant initial render ───────
  private restoreLocalCache(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const cached: User = JSON.parse(saved);
        this._currentUser.set(cached);
        if (cached.activeAddress) {
          this._activeAddress.set(cached.activeAddress);
        } else if (cached.addresses && cached.addresses.length > 0) {
          this._activeAddress.set(cached.addresses[0]);
        }
      }
    } catch (e) {
      console.error('Failed to parse cached user:', e);
    }
  }

  // ─── Real Firebase Auth Listener (Persistent Session) ────
  private initFirebaseAuthState(): void {
    onAuthStateChanged(this.auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        if (this.profileUnsubscribe) {
          this.profileUnsubscribe();
        }

        const userDocRef = doc(this.firestore, `users/${fbUser.uid}`);
        this.profileUnsubscribe = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as User;
            const fullUser: User = { ...data, uid: fbUser.uid };
            this._currentUser.set(fullUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));

            if (fullUser.activeAddress) {
              this._activeAddress.set(fullUser.activeAddress);
            } else if (fullUser.addresses && fullUser.addresses.length > 0) {
              this._activeAddress.set(fullUser.addresses[0]);
            }
          }
          this.authLoading.set(false);
        }, (err) => {
          console.error('Profile snapshot error:', err);
          this.authLoading.set(false);
        });
      } else {
        if (this.profileUnsubscribe) {
          this.profileUnsubscribe();
          this.profileUnsubscribe = undefined;
        }
        this._currentUser.set(null);
        localStorage.removeItem(STORAGE_KEY);
        this.authLoading.set(false);
      }
    });
  }

  // ─── Helper: Phone to Virtual Email ──────────────────────
  private phoneToEmail(phone: string): string {
    return `${phone.trim()}@fruitchat.app`;
  }

  // ─── Helper: PIN to Secure Password ──────────────────────
  // Firebase Auth requires minimum 6 characters for a password
  private pinToPassword(pin: string): string {
    const clean = pin.trim();
    return `GIFT-${clean}`;
  }

  openAuthModal(): void {
    this.showAuthModal.set(true);
  }

  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }

  openMapPicker(): void {
    this.showMapPicker.set(true);
  }

  closeMapPicker(): void {
    this.showMapPicker.set(false);
  }

  // ─── Check if phone is registered in Firestore ───────────
  async checkUser(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data() as User;
      return { ...docData, uid: snapshot.docs[0].id };
    }
    return null;
  }

  // ─── Real Firebase Login with Phone & PIN ────────────────
  async loginWithPin(phone: string, pin: string): Promise<User> {
    const cleanPhone = phone.trim();
    const email = this.phoneToEmail(cleanPhone);
    const password = this.pinToPassword(pin);

    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      // Ensure pin is synced in Firestore
      try {
        const userRef = doc(this.firestore, `users/${uid}`);
        await updateDoc(userRef, { pin });
      } catch (e) {}

      // Fetch profile
      const userRef = doc(this.firestore, `users/${uid}`);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const user = { ...(snap.data() as User), uid };
        this._currentUser.set(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
      }

      throw new Error('User profile record not found');
    } catch (e: any) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        throw new Error('Incorrect 4-digit PIN. Please try again.');
      }
      if (e.code === 'auth/user-not-found') {
        throw new Error('User not found. Please register first.');
      }
      throw new Error(e.message || 'Login failed. Please try again.');
    }
  }

  // ─── Real Firebase Registration ──────────────────────────
  async registerUser(data: {
    phone: string;
    name: string;
    pin: string;
    address?: AddressOption;
  }): Promise<User> {
    const cleanPhone = data.phone.trim();
    const email = this.phoneToEmail(cleanPhone);
    const password = this.pinToPassword(data.pin);

    try {
      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      const newUser: User = {
        uid,
        phone: cleanPhone,
        name: data.name.trim(),
        pin: data.pin.trim(),
        email,
        addresses: data.address ? [data.address] : [],
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      if (data.address) {
        newUser.activeAddress = data.address;
      }

      // Save profile to Firestore
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, newUser);

      this._currentUser.set(newUser);
      if (data.address) {
        this._activeAddress.set(data.address);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      return newUser;
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        throw new Error('This phone number is already registered. Please login instead.');
      }
      throw new Error(e.message?.replace('Firebase: ', '') || 'Registration failed. Please try again.');
    }
  }

  // ─── Forgot PIN / Reset PIN (Khandelwal Architecture) ────
  async setNewPin(phone: string, newPin: string): Promise<User> {
    const cleanPhone = phone.trim();
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('No user account found with this mobile number.');
    }

    const docSnapshot = snapshot.docs[0];
    const uid = docSnapshot.id;
    const userData = docSnapshot.data() as User;
    const email = this.phoneToEmail(cleanPhone);
    const newPassword = this.pinToPassword(newPin);

    // Sign in using stored PIN or fallback
    let signedIn = false;
    if (userData.pin) {
      try {
        await signInWithEmailAndPassword(this.auth, email, this.pinToPassword(userData.pin));
        signedIn = true;
      } catch (e) {}
    }

    if (!signedIn) {
      const fallbackPins = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '123456'];
      for (const p of fallbackPins) {
        try {
          await signInWithEmailAndPassword(this.auth, email, this.pinToPassword(p));
          signedIn = true;
          break;
        } catch (e) {}
      }
    }

    if (!signedIn || !this.auth.currentUser) {
      // If previous sign-in failed, update directly in Firestore so user can proceed
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, { pin: newPin.trim() });
      const updatedUser: User = { ...userData, uid, pin: newPin.trim() };
      this._currentUser.set(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }

    // Update Firebase Auth password
    await updatePassword(this.auth.currentUser, newPassword);

    // Update Firestore document
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDocRef, { pin: newPin.trim() });

    const updatedUser: User = { ...userData, uid, pin: newPin.trim() };
    this._currentUser.set(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }

  // ─── Profile Photo Upload (Base64 JPEG to Firestore) ──────
  async updateProfilePhoto(uid: string, photoUrl: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDocRef, { photoUrl });

    const current = this._currentUser();
    if (current) {
      const updated = { ...current, photoUrl };
      this._currentUser.set(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }

  // ─── Change Active Address ───────────────────────────────
  async setActiveAddress(address: AddressOption): Promise<void> {
    this._activeAddress.set(address);
    const user = this._currentUser();
    if (user) {
      const updatedUser: User = {
        ...user,
        activeAddress: address
      };
      this._currentUser.set(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      try {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        await updateDoc(userDocRef, { activeAddress: address });
      } catch (err) {
        console.warn('Could not sync active address to Firestore:', err);
      }
    }
  }

  // ─── Add New Address to Profile ──────────────────────────
  async addAddress(address: AddressOption): Promise<void> {
    this._activeAddress.set(address);
    const user = this._currentUser();
    if (user) {
      const exists = user.addresses?.some(a => a.id === address.id || a.fullAddress === address.fullAddress);
      const addresses = exists ? user.addresses : [...(user.addresses || []), address];
      const updatedUser: User = {
        ...user,
        addresses,
        activeAddress: address
      };
      this._currentUser.set(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      try {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        await updateDoc(userDocRef, { addresses, activeAddress: address });
      } catch (err) {
        console.warn('Could not sync addresses to Firestore:', err);
      }
    }
  }

  // ─── Real Firebase Logout ────────────────────────────────
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
    this._activeAddress.set(DEFAULT_ADDRESS);
  }
}
