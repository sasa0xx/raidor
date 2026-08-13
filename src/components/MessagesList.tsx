import type React from "react";
import { useChat } from "../context/ChatContext";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { Button } from "./Button";

export function MessagesList({ ref: messagesContainerRef }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const { selectedUserId, messages } = useChat();
  const { user } = useAuth();

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-3">
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

          return (
            <div
              key={message.id}
              className={`relative group flex flex-col w-full ${isMe ? "items-end" : "items-start"
                }`}
            >

              {isMe && <div className="hidden z-10 group-hover:flex items-center absolute -top-8">
                <Button varient="ghost" className="small-btn">
                  <MdEdit size={14} />
                </Button>
                <Button varient="ghost" className="small-btn">
                  <MdDeleteForever size={14} />
                </Button>
              </div>
              }
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs wrap-break-words ${isMe
                  ? "bg-violet-600 text-white rounded-br-xs"
                  : "bg-white text-slate-900 border border-slate-200/80 dark:bg-gray-800/90 dark:text-gray-100 dark:border-gray-700/50 rounded-bl-xs"
                  }`}
              >
                {message.content}
              </div>

              <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 mt-1 px-1">
                {formatTime(message.sent_at)}
              </span>

            </div>
          );
        })
      )}
    </div>
  )
}
