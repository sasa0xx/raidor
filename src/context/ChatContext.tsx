import type React from "react";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useHandleMessageChange } from "../hooks/useHandleMessagesChange";
import { useFetchFriends } from "../hooks/useFetchFriends";
import { useFetchMessages } from "../hooks/useFetchMessages";

export type RawMessage = {
  content: string;
  sent_at: string;
  sender: { username: string } | { username: string }[] | null;
};

export type RawProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_path: string | null;
  bio: string | null;
  sent: RawMessage[];
  received: RawMessage[];
};

export interface Card {
  id: string;
  bio: string | null;
  display_name: string;
  avatar_path: string | null;
  sender: string;
  lastMessage: string;
}

export interface Message {
  id: string; sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  edited_at: string | null;
  reply_to: string | null;
}

interface ChatContextType {
  selectedUserId: string | null,
  setSelectedUserId: React.Dispatch<React.SetStateAction<string | null>>,
  isSidebarOpen: boolean,
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>,
  replyId: string | null,
  setReplyId: React.Dispatch<React.SetStateAction<string | null>>,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  friendList: Card[],
  userRef: React.RefObject<User | null>,
  friendsRef: React.RefObject<string[]>,
  usernameRef: React.RefObject<string>,
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { profile, friends, user } = useAuth();
  const userRef = useRef<User | null>(null);
  const friendsRef = useRef<string[]>([]);
  const usernameRef = useRef("");
  useEffect(() => {
    userRef.current = user;
    friendsRef.current = friends;
    usernameRef.current = profile?.username ?? "";
  }, [user, friends, profile?.username]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { messages, setMessages } = useFetchMessages(selectedUserId);
  const friendList = useFetchFriends(friendsRef, usernameRef);
  useHandleMessageChange(friendsRef, userRef, setMessages);

  return (
    <ChatContext.Provider value={{ friendList, messages, selectedUserId, setSelectedUserId, replyId, setReplyId, usernameRef, userRef, friendsRef, setIsSidebarOpen, setMessages, isSidebarOpen }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }

  return context;
}
