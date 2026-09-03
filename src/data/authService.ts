import { UserAccount, AuthSession, UserRole } from '../types';
import { saveUserToFirestore, findFirestoreUserByEmail, fetchFirestoreUsers } from '../lib/firebase';

const USERS_STORAGE_KEY = 'revenueflow_registered_users_v2';
const SESSION_STORAGE_KEY = 'revenueflow_auth_session_v2';

export const INITIAL_DEMO_USERS: UserAccount[] = [
  {
    id: 'user-demo-1',
    name: 'Alex Mercer',
    email: 'alex@revenueflow.io',
    password: 'Password123!',
    role: 'owner',
    businessName: 'Apex Cloud Solutions',
    phone: '+1 (415) 555-0192',
    avatarColor: '#2563eb',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-demo-2',
    name: 'Sarah Chen',
    email: 'sarah@techagency.dev',
    password: 'Password123!',
    role: 'manager',
    businessName: 'Chen Creative Studio',
    phone: '+1 (212) 555-0144',
    avatarColor: '#059669',
    createdAt: '2026-02-01'
  },
  {
    id: 'user-demo-3',
    name: 'Rajesh Verma',
    email: 'rajesh@vermafin.in',
    password: 'Password123!',
    role: 'accountant',
    businessName: 'Verma Financial Services',
    phone: '+91 98765 43210',
    avatarColor: '#7c3aed',
    createdAt: '2026-02-10'
  }
];

// Helper to retrieve all registered accounts
export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load registered users from localStorage:', err);
  }
  return INITIAL_DEMO_USERS;
}

// Helper to save registered users
export function saveRegisteredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to save registered users to localStorage:', err);
  }
}

// Merge users from cloud into local cache without overwriting demo accounts
export function mergeUsersWithLocalCache(cloudUsers: UserAccount[]): UserAccount[] {
  const localUsers = getRegisteredUsers();
  const map = new Map<string, UserAccount>();

  INITIAL_DEMO_USERS.forEach((u) => {
    if (u.email) map.set(u.email.toLowerCase(), u);
  });
  localUsers.forEach((u) => {
    if (u.email) map.set(u.email.toLowerCase(), u);
  });
  cloudUsers.forEach((u) => {
    if (u.email) map.set(u.email.toLowerCase(), u);
  });

  const merged = Array.from(map.values());
  saveRegisteredUsers(merged);
  return merged;
}

// Sync users from Firestore
export async function syncUsersWithCloud(): Promise<UserAccount[]> {
  try {
    const cloudUsers = await fetchFirestoreUsers();
    if (cloudUsers && cloudUsers.length > 0) {
      return mergeUsersWithLocalCache(cloudUsers);
    }
  } catch (err) {
    console.warn('[Auth] Error syncing users with cloud:', err);
  }
  return getRegisteredUsers();
}

// Check current active session
export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session && session.user && session.token) {
      return session;
    }
  } catch (err) {
    console.warn('Failed to load active session:', err);
  }
  return null;
}

// Save active session
export function saveActiveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save active session:', err);
  }
}

// Clear active session (Logout)
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear active session:', err);
  }
}

// Registration function
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: UserRole;
  phone?: string;
}

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // violet
  '#ea580c', // orange
  '#0891b2', // cyan
  '#db2777'  // pink
];

export async function registerUser(
  payload: RegisterPayload
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  const normalizedEmail = payload.email.trim().toLowerCase();

  // Validate fields
  if (!payload.name.trim()) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!payload.businessName.trim()) {
    return { success: false, error: 'Business / Company name is required.' };
  }

  // Check email collision locally and in Firestore
  const users = getRegisteredUsers();
  let existing = users.find((u) => u.email && u.email.toLowerCase() === normalizedEmail);
  if (!existing) {
    try {
      existing = (await findFirestoreUserByEmail(normalizedEmail)) || undefined;
    } catch {
      // safe fallback
    }
  }

  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
  }

  // Pick random avatar color
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newUser: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: payload.name.trim(),
    email: normalizedEmail,
    password: payload.password,
    businessName: payload.businessName.trim(),
    role: payload.role || 'owner',
    phone: payload.phone?.trim() || '',
    avatarColor,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const updatedUsers = [...users, newUser];
  saveRegisteredUsers(updatedUsers);

  // Sync to Firestore immediately and await confirmation
  try {
    await saveUserToFirestore(newUser);
  } catch (err) {
    console.warn('Could not sync user with Firestore immediately, cached locally:', err);
  }

  const session: AuthSession = {
    user: newUser,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginAt: new Date().toISOString()
  };

  saveActiveSession(session);

  return { success: true, session };
}

// Login function (checks both local storage and Google Cloud Firestore)
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  // 1. Check local storage cache
  let users = getRegisteredUsers();
  let user = users.find((u) => u.email && u.email.toLowerCase() === normalizedEmail);

  // 2. If not found locally, query Firestore directly
  if (!user) {
    try {
      const cloudUser = await findFirestoreUserByEmail(normalizedEmail);
      if (cloudUser) {
        user = cloudUser;
        // Merge into local storage so future logins and offline access are instant
        const filtered = users.filter((u) => u.email && u.email.toLowerCase() !== normalizedEmail);
        saveRegisteredUsers([...filtered, cloudUser]);
      }
    } catch (err) {
      console.warn('[Auth] Error querying user in Firestore:', err);
    }
  }

  // 3. If still not found after checking local and cloud
  if (!user) {
    return { success: false, error: 'No account found with this email. Please verify or register a new account.' };
  }

  // 4. Check password
  if (user.password && user.password !== password) {
    return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
  }

  const session: AuthSession = {
    user,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginAt: new Date().toISOString()
  };

  saveActiveSession(session);

  return { success: true, session };
}

// Helper to switch directly to a demo account
export function loginDemoUser(userId: string): { success: boolean; session?: AuthSession } {
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId) || INITIAL_DEMO_USERS[0];

  const session: AuthSession = {
    user,
    token: `tok_demo_${Date.now()}`,
    loginAt: new Date().toISOString()
  };

  saveActiveSession(session);
  return { success: true, session };
}
