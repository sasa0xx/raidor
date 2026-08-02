import { useEffect, useState } from "react"
import { FaUserEdit } from "react-icons/fa";
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Message {
  id: string,
  sender_id: string,
  receiver_id: string,
  content: string,
  created_at: string,
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
  id: string,
  username: string,
  sender: string,
  lastMessage: string,
}

export function Main() {
  const { username, friends, user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [friendList, setFriendList] = useState<Card[]>([]);

  useEffect(() => {
    const fetchStuff = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          username,
          id,
          sent:messages!sender_id(content, sent_at, sender:profiles!sender_id(username)),
          received:messages!receiver_id(content, sent_at, sender:profiles!sender_id(username))
        `)
        .in('id', friends)
        .order('sent_at', { referencedTable: 'sent', ascending: false }).limit(1, { referencedTable: 'sent' })
        .order('sent_at', { referencedTable: 'received', ascending: false }).limit(1, { referencedTable: 'received' });

      if (error || !data)
        return;

      const profiles = data as unknown as RawProfile[];

      const cards: Card[] = profiles.map((profile) => {
        const lastSent = profile.sent[0];
        const lastReceived = profile.received[0];

        let latestMsg: RawMessage | null = null;
        if (lastSent && lastReceived) {
          latestMsg = new Date(lastSent.sent_at) > new Date(lastReceived.sent_at)
            ? lastSent
            : lastReceived;
        } else {
          latestMsg = lastSent || lastReceived || null;
        }

        const senderData = Array.isArray(latestMsg?.sender)
          ? latestMsg?.sender[0]
          : latestMsg?.sender;

        const sn = senderData?.username ?? '';

        return {
          id: profile.id,
          username: profile.username ?? '',
          sender: sn === username ? 'You' : sn,
          lastMessage: latestMsg?.content ?? '',
        };
      });

      setFriendList(cards);
    };

    fetchStuff();
  }, [friends]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`receiver_id.eq.${selectedUserId},sender_id.eq.${selectedUserId}`);

      if (data && !error) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  return (
    <div>
      {isWindowOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50" onClick={() => setIsWindowOpen(false)}>
          <div className="w-80 rounded-2xl border p-4 flex flex-col shadow-2xl text-white border-gray-600 bg-gray-900" onClick={(e) => e.stopPropagation()}>
            FLOATING WINDOW!
            <Button varient='secondary' onClick={() => { setIsWindowOpen(false) }}>x</Button>
          </div>
        </div>
      )}

      <div className="h-screen w-screen overflow-hidden flex bg-gray-950 text-gray-100">

        <aside className="flex flex-col items-center gap-2 w-64 border-r py-4 bg-gray-900 border-gray-400">
          <div className="flex flex-wrap w-full justify-between items-center pb-2 px-2 border-b border-gray-400">
            <div className="flex gap-x-2 items-center px-2">
              <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold">{username[0]}</div>
              <p className="text-lg">{username}</p>
            </div>
            <div className="flex gap-x-2">
              <Button varient='ghost' className="border-0" onClick={() => { setIsWindowOpen(true) }}>
                <FaUserEdit size={24} color="#ddd" />
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-col p-2">
            <Input className="py-1 px-2" placeholder="Search conversations" />
          </div>
          <div className="w-full flex flex-col gap-y-1 p-2">
            {friendList.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No conversations yet
              </div>
            ) : (
              friendList.map((chat) => (
                <div
                  key={chat.username}
                  className="flex items-center gap-x-3.5 p-3 rounded-xl hover:bg-gray-800/60 border border-transparent hover:border-gray-800/80 transition-all cursor-pointer group"
                  onClick={() => setSelectedUserId(chat.id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-gray-100 font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                      {chat.username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-violet-400 transition-colors truncate">
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
              ))
            )}
          </div>
        </aside >
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-3 bg-gray-950">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-3 text-violet-400">
                💬
              </div>
              <p className="text-sm font-medium text-gray-400">No messages yet</p>
              <p className="text-xs text-gray-600 mt-1">Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === user?.id;
              const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={message.id}
                  className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${isMe
                      ? 'bg-violet-600 text-white rounded-br-xs'
                      : 'bg-gray-800/90 text-gray-100 border border-gray-700/50 rounded-bl-xs'
                      }`}
                  >
                    {message.content}
                  </div>

                  <span className="text-[10px] font-medium text-gray-500 mt-1 px-1">
                    {formattedTime}
                  </span>
                </div>
              );
            })
          )}
        </main>
      </div >
    </div>
  )
}
