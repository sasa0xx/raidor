import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import { type Message as MessageType } from "../context/ChatContext";
import { useMessageActions } from "../hooks/useMessageActions";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { EditingMessage } from "./EditingMessage";

interface MessageProps {
  message: MessageType;
  isGrouped: boolean;
  isLastInGroup: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  editingContent: string;
  setEditingContent: (editingContent: string) => void;
}

export function Message({
  message,
  isGrouped,
  isLastInGroup,
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

  const { messages, friendList, selectedUserId } = useChat();
  const { user } = useAuth();

  const activeFriend = friendList.find((f) => f.id === selectedUserId);

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
        window.history.pushState({ messageSelected: true }, "");
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      hasMoved.current = true;
      clearLongPress();
    }
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (isMe) {
      if (dx < 0) setSwipeX(Math.max(dx, -100));
    } else {
      if (dx > 0) setSwipeX(Math.min(dx, 100));
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();
    if (Math.abs(swipeX) > 60) setReplyTarget();
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
      if (isMobileSelected) setIsMobileSelected(false);
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
      : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
        />
      ) : (
        <div className={`w-full flex ${isMe ? "justify-end pr-2" : "justify-start pl-2"} ${isGrouped ? "mt-0.5" : "mt-3"}`}>

          <div
            className={`absolute top-1/2 -translate-y-1/2 text-violet-500 z-10 ${isMe ? "right-6" : "left-6"}`}
            style={{ opacity: Math.min(Math.abs(swipeX) / 60, 1), pointerEvents: "none" }}
          >
            <FaReply />
          </div>

          <div
            className={`group flex w-full max-w-[85%] sm:max-w-[75%] md:max-w-md select-none transition-transform items-start gap-x-3 ${isMe ? "flex-row-reverse" : "flex-row"
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
            {!isMe && (
              <div className="w-8 shrink-0 flex justify-center">
                {!isGrouped && activeFriend && (
                  <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-xs mt-0.5">
                    {activeFriend.avatar_path ? (
                      <img src={activeFriend.avatar_path} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      activeFriend.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={`relative flex flex-col min-w-0 max-w-full ${isMe ? "items-end" : "items-start"}`}>

              <div
                className={`absolute -top-8 items-center gap-1 p-1 rounded-lg bg-white border border-slate-200 shadow-md dark:bg-gray-800 dark:border-gray-700 z-20 ${isMe ? "right-0" : "left-0"
                  } ${showActions ? "flex" : "hidden group-hover:flex"}`}
              >
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
                  <FaReply size={13} />
                </Button>

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
                      <MdEdit size={14} />
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
                      <MdDeleteForever size={15} />
                    </Button>
                  </>
                )}
              </div>

              <div
                className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm wrap-break-words max-w-full ${isMe
                  ? `bg-violet-600 text-white rounded-2xl ${isGrouped ? "rounded-tr-sm rounded-br-sm" : "rounded-br-sm"}`
                  : `bg-white text-slate-900 border border-slate-200/80 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700/50 rounded-2xl ${isGrouped ? "rounded-tl-sm rounded-bl-sm" : "rounded-bl-sm"}`
                  }`}
              >
                {repliedMessage && (
                  <div className={`mb-1.5 flex flex-col text-[11px] border-l-2 pl-2 py-0.5 truncate max-w-full ${isMe ? "border-violet-300 text-violet-100" : "border-violet-500 text-slate-500 dark:text-gray-400"
                    }`}>
                    <span className="font-bold">
                      {repliedMessage.sender_id === user?.id ? "You" : "Them"}
                    </span>
                    <span className="truncate opacity-90">{repliedMessage.content}</span>
                  </div>
                )}

                {message.content}

                {message.edited_at && (
                  <span className={`text-[10px] ml-2 inline-block ${isMe ? "text-violet-200/80" : "text-slate-400 dark:text-gray-500"}`}>
                    (edited)
                  </span>
                )}
              </div>

              {isLastInGroup && (
                <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 mt-1 px-1">
                  {formatTime(message.sent_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
