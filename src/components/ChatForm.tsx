import { IoSend } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { Button } from "./Button";
import { Input } from "./Input";
import { useChat } from "../context/ChatContext";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function ChatForm() {
  const {
    selectedUserId,
    setMessages,
    friendList,
    replyId,
    setReplyId,
    messages,
  } = useChat();

  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");

  const activeFriend = friendList.find((f) => f.id === selectedUserId);
  const replyMessage = messages.find((message) => message.id === replyId);

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
          reply_to: replyId,
        })
        .select()
        .single();

      if (error || !data) return;

      setMessages((p) => [...p, data]);
      setReplyId(null);
    };

    insertMessage();
    setNewMessage("");
  };

  return (
    <>
      {selectedUserId && (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200 dark:bg-gray-900 dark:border-gray-800/80"
        >
          {replyMessage && (
            <div className="mb-2 shrink-0 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="min-w-0">
                <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                  Replying to message
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-gray-400">
                  {replyMessage.content}
                </p>
              </div>

              <Button
                type="button"
                varient="ghost"
                className="small-btn ml-2 shrink-0"
                onClick={() => setReplyId(null)}
                aria-label="Cancel reply"
              >
                <FiX size={16} />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-x-2">
            <Input
              value={newMessage}
              type="search"
              inputMode="text"
              spellCheck={false}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeFriend?.display_name || "..."}`}
              className="flex-1 bg-slate-100 border-slate-200 dark:bg-gray-950/80 dark:border-gray-800 focus:border-violet-500 text-sm py-2 px-4"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium shrink-0"
            >
              <span>Send</span>
              <IoSend size={14} />
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
