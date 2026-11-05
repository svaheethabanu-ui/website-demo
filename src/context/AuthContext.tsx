import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types/record';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isStudent: boolean;
  isSupabaseLive: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInAsAdminDemo: () => void;
  signInAsStudentDemo: () => void;
  logout: () => Promise<void>;
  authError: string | null;
  authSuccess: string | null;
  clearAuthMessages: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const isSupabaseLive = isSupabaseConfigured();

  // Helper to fetch user role from public.profiles
  const fetchUserRoleAndProfile = async (userId: string, email: string): Promise<AppUser> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        return {
          id: userId,
          email,
          displayName: profile.full_name || email.split('@')[0],
          role: (profile.role as UserRole) || 'student',
        };
      }
    } catch (e) {
      console.warn('Profile fetch note:', e);
    }

    // Default fallback based on email
    const inferredRole: UserRole = email.includes('admin') ? 'admin' : 'student';
    return {
      id: userId,
      email,
      displayName: email.split('@')[0],
      role: inferredRole,
    };
  };

  useEffect(() => {
    // 1. If Supabase is live, listen to Supabase Auth state changes
    if (isSupabaseLive) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserRoleAndProfile(session.user.id, session.user.email || '').then((u) => {
            setUser(u);
            setLoading(false);
          });
        } else {
          // Check for local stored demo user
          checkLocalSavedUser();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const appUser = await fetchUserRoleAndProfile(session.user.id, session.user.email || '');
          setUser(appUser);
        } else {
          checkLocalSavedUser();
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      checkLocalSavedUser();
    }
  }, [isSupabaseLive]);

  const checkLocalSavedUser = () => {
    const saved = sessionStorage.getItem('apex_current_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setAuthError(null);
    setAuthSuccess(null);

    if (!isSupabaseLive) {
      // In local preview without Supabase keys, authenticate cleanly
      const cleanEmail = email.trim().toLowerCase();
      const role: UserRole = cleanEmail.includes('student') ? 'student' : 'admin';
      const mockUser: AppUser = {
        id: 'user_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        role,
        isDemo: true,
      };
      sessionStorage.setItem('apex_current_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data.user) {
      const appUser = await fetchUserRoleAndProfile(data.user.id, data.user.email || '');
      setUser(appUser);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'student'
  ) => {
    setAuthError(null);
    setAuthSuccess(null);

    if (!isSupabaseLive) {
      const cleanEmail = email.trim().toLowerCase();
      const mockUser: AppUser = {
        id: 'user_' + Date.now(),
        email: cleanEmail,
        displayName: fullName.trim() || cleanEmail.split('@')[0],
        role,
        isDemo: true,
      };
      sessionStorage.setItem('apex_current_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setAuthSuccess('Account registered successfully!');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data.user) {
      // If email confirmation is disabled in Supabase, user is signed in immediately
      if (data.session) {
        const appUser = await fetchUserRoleAndProfile(data.user.id, data.user.email || '');
        setUser(appUser);
      } else {
        setAuthSuccess('Registration successful! Please check your email to verify your account.');
      }
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    setAuthSuccess(null);

    if (!isSupabaseLive) {
      setAuthSuccess('Password reset link simulated for ' + email);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setAuthSuccess('Password reset link sent to ' + email);
  };

  const signInAsAdminDemo = () => {
    const adminUser: AppUser = {
      id: 'admin_demo_01',
      email: 'admin.manager@apexcloud.io',
      displayName: 'System Administrator',
      role: 'admin',
      isDemo: true,
    };
    sessionStorage.setItem('apex_current_user', JSON.stringify(adminUser));
    setUser(adminUser);
  };

  const signInAsStudentDemo = () => {
    const studentUser: AppUser = {
      id: 'student_demo_01',
      email: 'student.scholar@university.edu',
      displayName: 'Alex Rivers (Student)',
      role: 'student',
      isDemo: true,
    };
    sessionStorage.setItem('apex_current_user', JSON.stringify(studentUser));
    setUser(studentUser);
  };

  const logout = async () => {
    sessionStorage.removeItem('apex_current_user');
    if (isSupabaseLive) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  const currentRole = user?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: currentRole,
        isAdmin: currentRole === 'admin',
        isStudent: currentRole === 'student',
        isSupabaseLive,
        signInWithEmailPassword,
        signUpWithEmail,
        resetPassword,
        signInAsAdminDemo,
        signInAsStudentDemo,
        logout,
        authError,
        authSuccess,
        clearAuthMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
