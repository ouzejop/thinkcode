import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SpriteName } from '../sprites/matrices';
import type { CompletedExerciseRecord } from './profileStore';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface ProfileSnapshot {
  initials: string;
  avatar: SpriteName;
  courseId: 'javascript' | 'python';
  selfLevel: 'newcomer' | 'basics' | 'confident';
  coachLang: 'en' | 'fr';
  showOnLeaderboard: boolean;
  xp: number;
  completedExercises: Record<string, CompletedExerciseRecord>;
  rematchQueue: string[];
}

export interface StoredAccount {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  lastLoginAt: string;
  profile?: ProfileSnapshot;
}

export interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  accounts: Record<string, StoredAccount>;

  // Actions
  login: (email: string, password: string) => { success: boolean; error?: string; profile?: ProfileSnapshot };
  register: (
    email: string,
    password: string,
    profileData?: ProfileSnapshot,
  ) => { success: boolean; error?: string };
  continueAsGuest: () => void;
  logout: () => void;
  saveCurrentProgressToAccount: (profileData: ProfileSnapshot) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isGuest: true, // Default: local guest in browser
      accounts: {},

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized || !password) {
          return { success: false, error: 'Please enter your email and password.' };
        }

        const account = get().accounts[normalized];
        if (!account) {
          return {
            success: false,
            error: 'No account found for this email. Please create an account.',
          };
        }

        if (account.password !== password) {
          return {
            success: false,
            error: 'Incorrect password. Please try again.',
          };
        }

        const updatedAccount: StoredAccount = {
          ...account,
          lastLoginAt: new Date().toISOString(),
        };

        set((state) => ({
          currentUser: {
            id: account.id,
            email: account.email,
            createdAt: account.createdAt,
          },
          isAuthenticated: true,
          isGuest: false,
          accounts: {
            ...state.accounts,
            [normalized]: updatedAccount,
          },
        }));

        return {
          success: true,
          profile: account.profile,
        };
      },

      register: (email, password, profileData) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized || !normalized.includes('@') || !normalized.includes('.')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }

        if (!password || password.length < 4) {
          return {
            success: false,
            error: 'Password must be at least 4 characters.',
          };
        }

        const existing = get().accounts[normalized];
        if (existing) {
          return {
            success: false,
            error: 'An account already exists with this email. Please log in.',
          };
        }

        const userId = `usr-acc-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        const newAccount: StoredAccount = {
          id: userId,
          email: normalized,
          password,
          createdAt: now,
          lastLoginAt: now,
          profile: profileData,
        };

        set((state) => ({
          currentUser: {
            id: userId,
            email: normalized,
            createdAt: now,
          },
          isAuthenticated: true,
          isGuest: false,
          accounts: {
            ...state.accounts,
            [normalized]: newAccount,
          },
        }));

        return { success: true };
      },

      continueAsGuest: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          isGuest: true,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          isGuest: true,
        });
      },

      saveCurrentProgressToAccount: (profileData) => {
        const current = get().currentUser;
        if (!current) return;
        const normalized = current.email.toLowerCase();
        const account = get().accounts[normalized];
        if (!account) return;

        set((state) => ({
          accounts: {
            ...state.accounts,
            [normalized]: {
              ...account,
              profile: profileData,
            },
          },
        }));
      },
    }),
    {
      name: 'thinkcode-auth-v1',
    },
  ),
);
