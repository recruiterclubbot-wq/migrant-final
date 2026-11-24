import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  driveGoogleProvider,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { UserProfile } from '../types/migrant';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  authError: string | null;
  driveAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  connectGoogleDrive: () => Promise<string | null>;
  clearDriveToken: () => void;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BOOTSTRAPPED_ADMIN_EMAILS = new Set([
  'otzyvtyt@gmail.com',
  'recruiterclub.bot@gmail.com',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // Cached strictly in memory (never persisted to localStorage or sessionStorage)
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);

  const syncUserAndAdmin = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      setIsAdmin(false);
      setDriveAccessToken(null);
      return;
    }

    const userPath = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data() as UserProfile);
      } else if (firebaseUser.emailVerified && firebaseUser.email) {
        const newProfile: Record<string, unknown> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Пользователь',
          accountType: 'candidate',
          role: 'candidate',
          status: 'active',
          savedVacancyIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        const createdSnap = await getDoc(userRef);
        if (createdSnap.exists()) {
          setProfile(createdSnap.data() as UserProfile);
        }
      }
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.GET, userPath);
      } catch (wrapped) {
        setAuthError(wrapped instanceof Error ? wrapped.message : 'Ошибка загрузки профиля');
      }
    }

    if (
      firebaseUser.email &&
      BOOTSTRAPPED_ADMIN_EMAILS.has(firebaseUser.email) &&
      firebaseUser.emailVerified
    ) {
      setIsAdmin(true);
      return;
    }

    try {
      const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
      setIsAdmin(adminSnap.exists());
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);
      if (!firebaseUser) {
        setDriveAccessToken(null);
      }
      await syncUserAndAdmin(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Не удалось выполнить вход';
      setAuthError(msg);
    }
  };

  const connectGoogleDrive = async (): Promise<string | null> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, driveGoogleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? null;
      if (!token) {
        setAuthError('Не удалось получить токен доступа Google Диска. Попробуйте ещё раз.');
        return null;
      }
      setDriveAccessToken(token);
      return token;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Не удалось подключить Google Диск';
      setAuthError(msg);
      return null;
    }
  };

  const clearDriveToken = () => {
    setDriveAccessToken(null);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setProfile(null);
    setIsAdmin(false);
    setDriveAccessToken(null);
  };

  const refreshProfile = async () => {
    await syncUserAndAdmin(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        authReady,
        authError,
        driveAccessToken,
        signInWithGoogle,
        connectGoogleDrive,
        clearDriveToken,
        signOutUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
