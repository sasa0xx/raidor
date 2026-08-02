import { useEffect, useState, useRef } from "react";
import { FaUserEdit } from "react-icons/fa";
import { IoChatbubbleEllipsesSharp, IoSend } from "react-icons/io5";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
}

type RawMessage = {
  content: string;
  sent_at: string;
  sender: { username: string } | { username: string }[] | null;
};

type RawProfile = {
  id: string;
  username: string;
  sent: RawMessage[];
  received: RawMessage[];
};

interface Card {
  id: string;
  username: string;
  sender: string;
  lastMessage: string;
}

export function Main() {
  const { username, friends, user, refreshFriends } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [friendList, setFriendList] = useState<Card[]>([]);
  const [windowError, setWindowError] = useState("");
  const [windowUsername, setWindowUsername] = useState("");
  const userRef = useRef<User | null>(null);
  const friendsRef = useRef<string[]>([]);
  const usernameRef = useRef("");

  const activeFriend = friendList.find((f) => f.id === selectedUserId);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    userRef.current = user;
    friendsRef.current = friends;
    usernameRef.current = username;
  }, [user, friends, username])

  useEffect(() => {
    console.log("started listening!")
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log(payload)
          const newMessage = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage]
          })

          if (!friendsRef.current.includes(newMessage.sender_id) && newMessage.sender_id != userRef.current?.id) {
            refreshFriends();
          }
        }
      ).subscribe((status) => {
        console.log('Realtime status:', status);
      });

    return () => { supabase.removeChannel(channel); };

  }, []);

  useEffect(() => {
    const fetchStuff = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          username,
          id,
          sent:messages!sender_id(content, sent_at, sender:profiles!sender_id(username)),
          received:messages!receiver_id(content, sent_at, sender:profiles!sender_id(username))
        `)
        .in("id", friendsRef.current)
        .order("sent_at", { referencedTable: "sent", ascending: false })
        .limit(1, { referencedTable: "sent" })
        .order("sent_at", { referencedTable: "received", ascending: false })
        .limit(1, { referencedTable: "received" });

      if (error || !data) return;

      const profiles = data as unknown as RawProfile[];

      const cards: Card[] = profiles.map((profile) => {
        const lastSent = profile.sent[0];
        const lastReceived = profile.received[0];

        let latestMsg: RawMessage | null = null;
        if (lastSent && lastReceived) {
          latestMsg =
            new Date(lastSent.sent_at) > new Date(lastReceived.sent_at)
              ? lastSent
              : lastReceived;
        } else {
          latestMsg = lastSent || lastReceived || null;
        }

        const senderData = Array.isArray(latestMsg?.sender)
          ? latestMsg?.sender[0]
          : latestMsg?.sender;

        const sn = senderData?.username ?? "";

        return {
          id: profile.id,
          username: profile.username ?? "",
          sender: sn === usernameRef.current ? "You" : sn,
          lastMessage: latestMsg?.content ?? "",
        };
      });

      setFriendList(cards);
    };

    fetchStuff();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`receiver_id.eq.${selectedUserId},sender_id.eq.${selectedUserId}`);

      if (data && !error) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const insertMessage = async () => {
      const { data, error } = await supabase.from('messages').insert({ sender_id: user?.id, receiver_id: selectedUserId, content: newMessage.trim() }).select().single()

      if (error || !data)
        return;

      setMessages(p => [...p, data]);
    }

    insertMessage();
    setNewMessage("");
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();

    const addFriend = async () => {
      const { data, error } = await supabase.from('profiles').select("id").eq('username', windowUsername).single()

      if (error || !data) {
        setWindowError("Cannot find a user with that username.")
        return;
      }
      await supabase.from('messages').insert({ sender_id: user?.id, receiver_id: data.id, content: `${username} Started the conversation` })

      await refreshFriends()
      setIsWindowOpen(false);
    }

    addFriend();
  }

  return (
    <div>
      {isWindowOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black/60 z-50 backdrop-blur-xs"
          onClick={() => setIsWindowOpen(false)}
        >
          <div
            className="w-80 rounded-2xl border p-4 flex flex-col shadow-2xl text-white border-gray-800 bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Add friend</h3>
              <Button
                varient="ghost"
                className="px-2 py-1 border-0"
                onClick={() => setIsWindowOpen(false)}
              >
                ✕
              </Button>
            </div>

            {windowError && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                {windowError}
              </div>
            )}
            <form onSubmit={handleAddFriend}>
              <p className="text-sm text-gray-100 mb-2">username</p>
              <Input placeholder="username" value={windowUsername} onChange={(e) => setWindowUsername(e.target.value)} />

              <Button
                varient="secondary"
                type="submit"
                className='mt-4'
              >
                Add friend
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="h-screen w-screen overflow-hidden flex bg-gray-950 text-gray-100">
        <aside className="flex flex-col w-72 border-r bg-gray-900 border-gray-800/80">
          <div className="flex items-center justify-between p-3.5 border-b border-gray-800">
            <div className="flex gap-x-2.5 items-center">
              <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-sm">
                {username ? username[0]?.toUpperCase() : "?"}
              </div>
              <p className="font-semibold text-sm text-gray-100">{username}</p>
            </div>
            <Button
              varient="ghost"
              className="p-2 border-0 hover:bg-gray-800 text-gray-400 hover:text-gray-100"
              onClick={() => setIsWindowOpen(true)}
            >
              <FaUserEdit size={18} />
            </Button>
          </div>

          <div className="p-3">
            <Input className="py-1.5 px-3 text-sm bg-gray-950/60 border-gray-800" placeholder="Search conversations" />
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {friendList.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No conversations yet
              </div>
            ) : (
              friendList.map((chat) => {
                const isSelected = chat.id === selectedUserId;
                return (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-x-3 p-2.5 rounded-xl transition-all cursor-pointer group ${isSelected
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800/50 text-gray-300"
                      }`}
                    onClick={() => setSelectedUserId(chat.id)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-gray-100 font-bold text-sm shadow-sm">
                        {chat.username.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-semibold truncate">
                          {chat.username}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-400 truncate">
                        {chat.lastMessage ? (
                          <>
                            <span className="font-medium text-gray-300">
                              {chat.sender}:
                            </span>{" "}
                            {chat.lastMessage}
                          </>
                        ) : (
                          <span className="italic text-gray-500">No messages yet</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full bg-gray-950 min-w-0">
          {activeFriend && (
            <div className="px-6 py-3.5 bg-gray-900 border-b border-gray-800/80 flex items-center gap-x-3.5 shadow-xs">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
                {activeFriend.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-gray-100">{activeFriend.username}</h2>
                <span className="text-[11px] text-violet-400 font-medium">Active Chat</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-3">
            {!selectedUserId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-3 text-violet-400 shadow-inner">
                  <IoChatbubbleEllipsesSharp size="28" color="#fff" />
                </div>
                <p className="text-base font-semibold text-gray-300">Select a conversation</p>
                <p className="text-xs text-gray-500 mt-1">Choose a friend from the left panel to start messaging.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-3 text-violet-400">
                  <IoChatbubbleEllipsesSharp size="22" />
                </div>
                <p className="text-sm font-medium text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-600 mt-1">Send a message below to kick off the chat!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs break-words ${isMe
                        ? "bg-violet-600 text-white rounded-br-xs"
                        : "bg-gray-800/90 text-gray-100 border border-gray-700/50 rounded-bl-xs"
                        }`}
                    >
                      {message.content}
                    </div>

                    <span className="text-[10px] font-medium text-gray-500 mt-1 px-1">
                      {formatTime(message.sent_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {selectedUserId && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-gray-900 border-t border-gray-800/80 flex items-center gap-x-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${activeFriend?.username || "..."}`}
                className="flex-1 bg-gray-950/80 border-gray-800 focus:border-violet-500 text-sm py-2 px-4"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium flex-shrink-0"
              >
                <span>Send</span>
                <IoSend size={14} />
              </Button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
