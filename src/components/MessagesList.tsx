import React from "react";
import { useChat } from "../context/ChatContext";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { Button } from "./Button";
import { supabase } from "../lib/supabase";
import { useState } from "react";
import { Input } from "./Input";

export function MessagesList({
  ref: messagesContainerRef,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");

  const { selectedUserId, messages, setMessages } = useChat();
  const { user } = useAuth();

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return isNaN(date.getTime())
      ? ""
      : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", user.id);

    if (error) {
      console.error("Failed to delete message:", error);
      return;
    }

    setMessages((prev) =>
      prev.filter((message) => message.id !== messageId)
    );
  };

  const editMessage = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!user || !editingMessageId || !editingContent.trim()) return;

    const { data, error } = await supabase
      .from("messages")
      .update({
        content: editingContent.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq("id", editingMessageId)
      .eq("sender_id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to edit message:", error);
      return;
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === editingMessageId ? data : message
      )
    );

    setEditingMessageId(null);
    setEditingContent("");
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto flex flex-col gap-y-3"
    >
      {!selectedUserId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-gray-500">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-center mb-3 text-violet-500 dark:text-violet-400 shadow-inner">
            <IoChatbubbleEllipsesSharp size="28" />
          </div>

          <p className="text-base font-semibold text-slate-700 dark:text-gray-300">
            Select a conversation
          </p>

          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
            Choose a friend from the left panel to start messaging.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-gray-500">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-center mb-3 text-violet-500 dark:text-violet-400">
            <IoChatbubbleEllipsesSharp size="22" />
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-gray-400">
            No messages yet
          </p>

          <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">
            Send a message below to kick off the chat!
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const isMe = message.sender_id === user?.id;
          const isEditing = isMe && editingMessageId === message.id;

          return (
            <React.Fragment key={message.id}>
              {isEditing ? (
                <form
                  onSubmit={editMessage}
                  className="flex flex-col items-end w-full px-4 py-1.5"
                >
                  <Input
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    autoFocus
                    className="max-w-[85%] sm:max-w-[75%] md:max-w-md w-full"
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      varient="ghost"
                      className="small-btn"
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditingContent("");
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="px-3 py-1.5 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  className={`group relative px-4 py-1.5 flex flex-col w-full transition-colors ${isMe ? "items-end" : "items-start"
                    } hover:bg-black/5 dark:hover:bg-white/5`}
                >
                  {isMe && (
                    <div
                      className="absolute right-4 -top-5 hidden group-hover:flex items-center gap-0.5
                      p-1 rounded-lg bg-white border border-slate-200 shadow-md
                      dark:bg-gray-800 dark:border-gray-700"
                    >
                      <Button
                        type="button"
                        varient="ghost"
                        className="message-action"
                        aria-label="Edit message"
                        onClick={() => {
                          setEditingMessageId(message.id);
                          setEditingContent(message.content);
                        }}
                      >
                        <MdEdit size={15} />
                      </Button>

                      <Button
                        type="button"
                        varient="ghost"
                        className="message-action"
                        aria-label="Delete message"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <MdDeleteForever size={16} />
                      </Button>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] md:max-w-md px-4 py-2.5
                    rounded-2xl text-sm leading-relaxed shadow-xs wrap-break-words ${isMe
                        ? "bg-violet-600 text-white rounded-br-xs"
                        : "bg-white text-slate-900 border border-slate-200/80 dark:bg-gray-800/90 dark:text-gray-100 dark:border-gray-700/50 rounded-bl-xs"
                      }`}
                  >
                    {message.content}
                  </div>

                  <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 mt-1 px-1">
                    {formatTime(message.sent_at)}
                    {message.edited_at && " · edited"}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}
