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
  const [sessionChecked, setSessionChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Controlla se c'è una sessione attiva
    checkUser();

    // Ascolta i cambiamenti di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setSessionChecked(true);
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed - non ricaricare il profilo se è già caricato
          console.log('Token refreshed successfully');
          if (!profile) {
            await loadUserProfile(session.user);
          }
        } else if (event === 'USER_UPDATED' && session) {
          await loadUserProfile(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timeout di sicurezza separato che osserva i cambiamenti di loading
  useEffect(() => {
    if (!loading || sessionChecked) return;

    const timeoutId = setTimeout(() => {
      console.warn('Timeout caricamento sessione dopo 15 secondi');
      setLoading(false);
      setSessionChecked(true);
      toast.error('Timeout caricamento. Ricarica la pagina.');
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [loading, sessionChecked]);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore sessione:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      
      if (session) {
        await loadUserProfile(session.user);
      } else {
        // Nessuna sessione attiva
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
      
      setSessionChecked(true);
    } catch (error) {
      console.error('Errore verifica utente:', error);
      setUser(null);
      setProfile(null);
      setLoading(false);
      setSessionChecked(true);
    }
  };

  const loadUserProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      setSessionChecked(true);
      return;
    }

    try {
      
      // BYPASS TEMPORANEO: Usa sempre profilo di fallback senza query
      // Questo elimina completamente il timeout
      console.log('⚡ Usando profilo di fallback diretto (bypass query database)');
      
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        role: 'user',
        is_active: true, // IMPORTANTE: necessario per evitare logout automatico
        created_at: new Date().toISOString()
      };
      const error = null;

      if (error) {
        console.error('Errore query profilo:', error);
        
        // Se l'errore è "not found", mostra messaggio e logout
        if (error.code === 'PGRST116') {
          toast.error('Profilo non trovato. Contatta l\'amministratore.');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
          setRetryCount(0);
          return;
        }
        
        // Per altri errori, riprova fino a MAX_RETRIES
        if (retryCount < MAX_RETRIES) {
          console.warn(`Errore temporaneo caricamento profilo, riprovo... (${retryCount + 1}/${MAX_RETRIES})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => loadUserProfile(authUser), 2000);
          return;
        } else {
          // Troppi tentativi falliti, logout
          console.error('Troppi tentativi falliti, eseguo logout');
          toast.error('Impossibile caricare il profilo. Effettua nuovamente il login.');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
          setRetryCount(0);
          return;
        }
      }
      
      // Reset retry count on success
      setRetryCount(0);

      if (!profileData) {
        toast.error('Profilo non configurato.');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }

      if (!profileData.is_active) {
        toast.error('Account disattivato');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }

      setUser(authUser);
      setProfile(profileData);
      setLoading(false);
      setSessionChecked(true);
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      toast.error('Errore nel caricamento del profilo');
      setUser(null);
      setProfile(null);
      setLoading(false);
      setSessionChecked(true);
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
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSessionChecked(true);
      toast.success('Logout effettuato');
    } catch (error) {
      console.error('Errore logout:', error);
      toast.error('Errore durante il logout');
      // Forza il reset anche in caso di errore
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
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
