import React from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import { type Message } from "../context/ChatContext";
import { useMessageActions } from "../hooks/useMessageActions";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

interface MessageProps {
  message: Message;
  isEditing: boolean;
  setIsEditing: (isEditng: boolean) => void;
  editingContent: string;
  setEditingContent: (editingContent: string) => void;
}

export function Message({
  message,
  isEditing,
  setIsEditing,
  editingContent,
  setEditingContent,
}: MessageProps) {
  const {
    isMe,
    isReplyTarget,
    setReplyTarget,
    editMessage,
    deleteMessage,
  } = useMessageActions(
    message,
    isEditing,
    editingContent,
    setIsEditing,
    setEditingContent
  );

  const { messages } = useChat();
  const { user } = useAuth();

  const repliedMessage = message.reply_to
    ? messages.find((m) => m.id === message.reply_to)
    : null;

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
                setIsEditing(false);
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
            } ${isReplyTarget
              ? "bg-violet-500/10 dark:bg-violet-500/10"
              : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
        >
          <div
            className={`absolute right-4 -top-5 items-center gap-0.5
              p-1 rounded-lg bg-white border border-slate-200 shadow-md
              dark:bg-gray-800 dark:border-gray-700
              ${isReplyTarget
                ? "flex"
                : "hidden group-hover:flex"
              }`}
          >
            {isMe && (
              <>
                <Button
                  type="button"
                  varient="ghost"
                  className="message-action"
                  aria-label="Edit message"
                  onClick={() => {
                    setIsEditing(true);
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
                  onClick={() => deleteMessage()}
                >
                  <MdDeleteForever size={16} />
                </Button>
              </>
            )}

            <Button
              type="button"
              varient="ghost"
              className="message-action"
              aria-label="Reply to message"
              onClick={() => setReplyTarget()}
            >
              <FaReply size={16} />
            </Button>
          </div>

          <div
            className={`max-w-[85%] sm:max-w-[75%] md:max-w-md px-4 py-2.5
              rounded-2xl text-sm leading-relaxed shadow-xs wrap-break-words ${isMe
                ? "bg-violet-600 text-white rounded-br-xs"
                : "bg-white text-slate-900 border border-slate-200/80 dark:bg-gray-800/90 dark:text-gray-100 dark:border-gray-700/50 rounded-bl-xs"
              }`}
          >
            {repliedMessage && (
              <div
                className={`mb-2 px-3 py-2 rounded-lg border-l-2 text-xs ${isMe
                  ? repliedMessage.sender_id === user?.id
                    ? "bg-violet-700/60 border-violet-300/70 text-violet-100"
                    : "bg-gray-100 dark:bg-gray-800 border-violet-500 text-slate-500 dark:text-gray-300"
                  : repliedMessage.sender_id === user?.id
                    ? "bg-violet-100 dark:bg-violet-700/80 border-violet-500 text-violet-700 dark:text-violet-300"
                    : "bg-gray-100 dark:bg-gray-800 border-violet-500 text-slate-500 dark:text-gray-300"
                  }`}
              >
                <p className="font-semibold mb-0.5">
                  {repliedMessage.sender_id === user?.id
                    ? "You"
                    : "Them"}
                </p>

                <p className="truncate opacity-80">
                  {repliedMessage.content}
                </p>
              </div>
            )}
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
}
