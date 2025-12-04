// /src/auth/useAuth.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { log } from "../lib/logger";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;
      setSession(currentSession);
      
      if (currentSession?.user?.id) {
        await loadProfile(currentSession.user.id);
      }
      setIsLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session ?? null);
      
      if (session?.user?.id) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,role")
        .eq("id", userId)
        .single();
      setProfile(data);
      return data;
    } catch (e) {
      log.error("loadProfile error", e);
      return null;
    }
  }

  // derived isAdmin (accept both root role and metadata role)
  const isAdmin =
    (session?.user?.role === "admin") ||
    (session?.user?.user_metadata?.role === "admin") ||
    (profile?.role === "admin");

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }

  return { 
    session, 
    profile, 
    loadProfile, 
    isAdmin, 
    isLoading,
    signIn,
    signOut,
  };
}