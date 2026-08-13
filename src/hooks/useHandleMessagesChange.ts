import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { type Message } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import type { User } from "@supabase/supabase-js";

export function useHandleMessageChange(
  friendsRef: React.RefObject<string[]>,
  userRef: React.RefObject<User>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const { refreshFriends } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log(payload);
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          if (
            !friendsRef.current.includes(newMessage.sender_id) &&
            newMessage.sender_id != userRef.current?.id
          ) {
            refreshFriends();
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
