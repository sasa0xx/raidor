import { IoSend } from "react-icons/io5";
import { Button } from "./Button";
import { Input } from "./Input";
import { useChat } from "../context/ChatContext";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function ChatForm() {
  const { selectedUserId, setMessages, friendList } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");

  const activeFriend = friendList.find((f) => f.id === selectedUserId);

  const handleSendMessage = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const insertMessage = async () => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          receiver_id: selectedUserId,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error || !data) return;

      setMessages((p) => [...p, data]);
    };

    insertMessage();
    setNewMessage("");
  };

  return (
    <>
      {selectedUserId && (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200 dark:bg-gray-900 dark:border-gray-800/80 flex items-center gap-x-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${activeFriend?.username || "..."}`}
            className="flex-1 bg-slate-100 border-slate-200 dark:bg-gray-950/80 dark:border-gray-800 focus:border-violet-500 text-sm py-2 px-4"
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
      )
      }
    </>
  );
}
