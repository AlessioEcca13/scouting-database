// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controlla se c'è una sessione attiva
    checkUser();

    // Ascolta i cambiamenti di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Errore verifica utente:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profileData, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Errore query profilo:', error);
        toast.error('Profilo non trovato. Contatta l\'amministratore.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profileData) {
        toast.error('Profilo non configurato.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profileData.is_active) {
        toast.error('Account disattivato');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setUser(authUser);
      setProfile(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      toast.error('Errore nel caricamento del profilo');
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      await loadUserProfile(data.user);
      return { success: true };
    } catch (error) {
      console.error('Errore login:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      toast.success('Logout effettuato');
    } catch (error) {
      console.error('Errore logout:', error);
      toast.error('Errore durante il logout');
    }
  };

  const hasPermission = (permission) => {
    if (!profile) return false;
    return profile[permission] === true;
  };

  const isAdmin = () => profile?.role === 'admin';
  const isScout = () => profile?.role === 'scout';
  const isViewer = () => profile?.role === 'viewer';

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasPermission,
    isAdmin,
    isScout,
    isViewer,
    // Permessi specifici
    canAddPlayers: hasPermission('can_add_players'),
    canEditPlayers: hasPermission('can_edit_players'),
    canDeletePlayers: hasPermission('can_delete_players'),
    canAddReports: hasPermission('can_add_reports'),
    canViewAllReports: hasPermission('can_view_all_reports'),
    canManageLists: hasPermission('can_manage_lists')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
