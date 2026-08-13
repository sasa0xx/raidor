import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Theme = "light" | "dark";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  friends: string[];
  loading: boolean;
  username: string;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  refreshFriends: () => void;
}

const Context = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [username, setUsername] = useState("");
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
      setUsername('');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    if (data && !error) {
      setUsername(data.username);
    }
    if (error) {
      setLoading(false);
      console.log("ERROR ERROR ERRROORRR!!");
      console.log(error);
    }

    const senderQuery = supabase
      .from('messages')
      .select('sender_id')
      .not('sender_id', 'eq', user.id)

    const receiverQuery = supabase
      .from('messages')
      .select('receiver_id')
      .not('receiver_id', 'eq', user.id)

    let [senderRes, receiverRes] = await Promise.all([senderQuery, receiverQuery]);
    if (senderRes.error || receiverRes.error) {
      console.log("ERROOOOOOR");
      console.log(senderRes.error);
      console.log(receiverRes.error);
      setLoading(false);
      return;
    }
    senderRes.data = senderRes.data ?? [];
    receiverRes.data = receiverRes.data ?? [];

    const flatUniqueArray = [
      ...new Set([
        ...senderRes.data.map(r => r.sender_id),
        ...receiverRes.data.map(r => r.receiver_id)
      ])
    ];
    setFriends(flatUniqueArray);
    console.log("FLAT UNIQUE ARRAY");
    console.log(flatUniqueArray);
    setLoading(false);
  };

  useEffect(() => {
    refreshFriends()
  }, [user])

  return (
    <Context.Provider value={{ session, user, friends, loading, theme, username, setTheme, refreshFriends }}>
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
