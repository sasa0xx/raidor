import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import { type Message } from "../context/ChatContext";
import { useMessageActions } from "../hooks/useMessageActions";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { EditingMessage } from "./EditingMessage";

interface MessageProps {
  message: Message;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
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

  const [swipeX, setSwipeX] = useState(0);
  const [isMobileSelected, setIsMobileSelected] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMoved = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasMoved.current = false;

    clearLongPress();

    longPressTimer.current = setTimeout(() => {
      if (!hasMoved.current && !isMobileSelected) {
        setIsMobileSelected(true);
        window.history.pushState(
          { messageSelected: true },
          ""
        );
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = e.touches[0];

    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      hasMoved.current = true;
      clearLongPress();
    }

    if (Math.abs(dy) > Math.abs(dx)) {
      return;
    }

    if (isMe) {
      if (dx < 0) {
        setSwipeX(Math.max(dx, -100));
      }
    } else {
      if (dx > 0) {
        setSwipeX(Math.min(dx, 100));
      }
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();

    if (Math.abs(swipeX) > 60) {
      setReplyTarget();
    }

    setSwipeX(0);

    touchStartX.current = null;
    touchStartY.current = null;
    hasMoved.current = false;
  };

  const handleTouchCancel = () => {
    clearLongPress();

    setSwipeX(0);

    touchStartX.current = null;
    touchStartY.current = null;
    hasMoved.current = false;
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isMobileSelected) {
        setIsMobileSelected(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearLongPress();
    };
  }, [isMobileSelected]);

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

  const showActions = isMobileSelected || isReplyTarget;

  return (
    <React.Fragment key={message.id}>
      {isEditing ? (
        <EditingMessage
          editMessage={editMessage}
          setIsEditing={setIsEditing}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
        />) : (
        <div className="relative w-full">
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-violet-500 ${isMe ? "right-2" : "left-2"
              }`}
            style={{
              opacity: Math.min(Math.abs(swipeX) / 60, 1),
            }}
          >
            <FaReply />
          </div>

          <div
            className={`group relative px-4 py-1.5 flex flex-col w-full select-none transition-colors ${isMe ? "items-end" : "items-start"
              } ${isReplyTarget || isMobileSelected
                ? "bg-violet-500/10 dark:bg-violet-500/10"
                : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            style={{
              transform: `translateX(${swipeX}px)`,
              WebkitUserSelect: "none",
              userSelect: "none",
              touchAction: "pan-y",
            }}
          >
            <div
              className={`absolute right-4 -top-5 items-center gap-0.5
                p-1 rounded-lg bg-white border border-slate-200 shadow-md
                dark:bg-gray-800 dark:border-gray-700
                ${showActions
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
                      setIsMobileSelected(false);
                    }}
                  >
                    <MdEdit size={15} />
                  </Button>

                  <Button
                    type="button"
                    varient="ghost"
                    className="message-action"
                    aria-label="Delete message"
                    onClick={() => {
                      deleteMessage();
                      setIsMobileSelected(false);
                    }}
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
                onClick={() => {
                  setReplyTarget();
                  setIsMobileSelected(false);
                }}
              >
                <FaReply size={16} />
              </Button>
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] md:max-w-md px-4 py-2.5
                rounded-2xl text-sm leading-relaxed shadow-xs
                wrap-break-words ${isMe
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
        </div>
      )}
    </React.Fragment>
  );
}
