import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { User } from '@/types';

export class FirebaseAuthService {
  static async register(email: string, password: string, name: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return this.mapFirebaseUser(userCredential.user);
  }

  static async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return this.mapFirebaseUser(userCredential.user);
  }

  static async loginWithGoogle(): Promise<User> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return this.mapFirebaseUser(userCredential.user);
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
    });
  }

  static getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  private static mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Kullanıcı',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  }
}
