import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Theme = "light" | "dark";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  avatar_path: string | null;
  bio: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  friends: string[];
  loading: boolean;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  refreshFriends: () => void;
}

const Context = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(false);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshFriends = async () => {
    if (!user) {
      setProfile(null);
      setFriends([]);
      return;
    }

    const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileData && !profileError) {
      setProfile(profileData);
    }

    const { data: requests, error: reqError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('status', 'accepted')

    if (reqError) {
      console.error("Error fetching friends:", reqError);
      return;
    }
    const friendIds = (requests || []).map((req) =>
      req.sender_id === user.id ? req.receiver_id : req.sender_id
    );

    setFriends([...new Set(friendIds)]);
  };

  useEffect(() => {
    refreshFriends()
  }, [user])

  return (
    <Context.Provider value={{ session, user, friends, loading, theme, profile, setTheme, refreshFriends }}>
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
