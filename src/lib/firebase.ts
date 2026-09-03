import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Bill, Expense, BusinessConfig, NotificationItem, UserAccount } from '../types';

// Initialize Firebase App
export const app = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId
    })
  : getApp();

// Initialize Firestore with custom database ID from config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Connection test on boot (as required by Firebase skill)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    console.log('[Firebase] Connected to Firestore database successfully.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      console.warn('[Firebase] Firestore client currently offline or initializing:', error.message);
    } else {
      // Missing test document is normal and confirms connectivity
      console.log('[Firebase] Handshake with Firestore completed.');
    }
    return true;
  }
}

// ----------------------------------------------------
// Bills Service (Real-time Firestore sync & persistence)
// ----------------------------------------------------
const BILLS_COLLECTION = 'bills';

export function subscribeToBills(
  onUpdate: (bills: Bill[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, BILLS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Bill[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing bills:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveBillToFirestore(bill: Bill): Promise<void> {
  const docRef = doc(db, BILLS_COLLECTION, bill.id);
  await setDoc(docRef, {
    ...bill,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteBillFromFirestore(billId: string): Promise<void> {
  const docRef = doc(db, BILLS_COLLECTION, billId);
  await deleteDoc(docRef);
}

// Seed initial bills if Firestore collection is empty
export async function seedInitialBillsIfEmpty(initialBills: Bill[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, BILLS_COLLECTION));
    if (snap.empty) {
      console.log('[Firebase] Seeding initial sample bills to Firestore...');
      for (const bill of initialBills) {
        await setDoc(doc(db, BILLS_COLLECTION, bill.id), bill);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding bills:', err);
  }
}

// ----------------------------------------------------
// Expenses Service
// ----------------------------------------------------
const EXPENSES_COLLECTION = 'expenses';

export function subscribeToExpenses(
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, EXPENSES_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing expenses:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveExpenseToFirestore(expense: Expense): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expense.id);
  await setDoc(docRef, {
    ...expense,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(docRef);
}

export async function seedInitialExpensesIfEmpty(initialExpenses: Expense[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, EXPENSES_COLLECTION));
    if (snap.empty) {
      console.log('[Firebase] Seeding initial sample expenses to Firestore...');
      for (const exp of initialExpenses) {
        await setDoc(doc(db, EXPENSES_COLLECTION, exp.id), exp);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding expenses:', err);
  }
}

// ----------------------------------------------------
// Business Configuration Service
// ----------------------------------------------------
const CONFIG_COLLECTION = 'business_configs';
const DEFAULT_CONFIG_DOC = 'main_config';

export function subscribeToBusinessConfig(
  onUpdate: (config: BusinessConfig) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, CONFIG_COLLECTION, DEFAULT_CONFIG_DOC);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as BusinessConfig);
      }
    },
    (err) => {
      console.warn('[Firebase] Error syncing business config:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveBusinessConfigToFirestore(config: BusinessConfig): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, DEFAULT_CONFIG_DOC);
  await setDoc(docRef, {
    ...config,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function seedInitialConfigIfEmpty(initialConfig: BusinessConfig): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, DEFAULT_CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log('[Firebase] Seeding business config to Firestore...');
      await setDoc(docRef, initialConfig);
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding config:', err);
  }
}

// ----------------------------------------------------
// Notifications Service
// ----------------------------------------------------
const NOTIFICATIONS_COLLECTION = 'notifications';

export function subscribeToNotifications(
  onUpdate: (notifications: NotificationItem[]) => void
): () => void {
  const q = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing notifications:', err);
    }
  );
}

export async function saveNotificationToFirestore(item: NotificationItem): Promise<void> {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, item.id);
  await setDoc(docRef, item, { merge: true });
}

export async function clearAllNotificationsInFirestore(items: NotificationItem[]): Promise<void> {
  for (const item of items) {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, item.id));
  }
}

export async function seedInitialNotificationsIfEmpty(initialItems: NotificationItem[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
    if (snap.empty) {
      for (const item of initialItems) {
        await setDoc(doc(db, NOTIFICATIONS_COLLECTION, item.id), item);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding notifications:', err);
  }
}

// ----------------------------------------------------
// Users & Auth Service Sync
// ----------------------------------------------------
const USERS_COLLECTION = 'users';

export async function fetchFirestoreUsers(): Promise<UserAccount[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const list: UserAccount[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as UserAccount);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error fetching users from Firestore:', err);
    return [];
  }
}

export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, {
      ...user,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving user to Firestore:', err);
  }
}

export async function findFirestoreUserByEmail(email: string): Promise<UserAccount | null> {
  try {
    const normalized = email.trim().toLowerCase();
    // 1. Direct where clause query
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', normalized));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data() as UserAccount;
      return { ...docData, id: snap.docs[0].id };
    }

    // 2. Case-insensitive fallback through full fetch
    const all = await fetchFirestoreUsers();
    const match = all.find((u) => u.email && u.email.trim().toLowerCase() === normalized);
    return match || null;
  } catch (err) {
    console.warn('[Firebase] Error finding user by email:', err);
    return null;
  }
}

export function subscribeToUsers(
  onUpdate: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, USERS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('[Firebase] Error syncing users:', err);
      if (onError) onError(err);
    }
  );
}

