import React from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { type Message } from "../context/ChatContext";
import { useMessageActions } from "../hooks/useMessageActions";

export function Message({ message }: { message: Message }) {
  const { isEditing, isMe, editingContent, setEditingMessageId, setEditingContent, editMessage, deleteMessage } = useMessageActions(message);

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
  )
}
