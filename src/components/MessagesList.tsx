import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { Message } from "./Message";

export function MessagesList({
  ref: messagesContainerRef,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const { selectedUserId, messages } = useChat();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto flex flex-col gap-y-1 min-h-0 p-4 pt-6"
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
        messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

          const isSameSenderAsPrev = prevMessage?.sender_id === message.sender_id;
          const timeDiffPrev = prevMessage
            ? Math.abs(new Date(message.sent_at).getTime() - new Date(prevMessage.sent_at).getTime())
            : 0;
          const isGrouped = Boolean(isSameSenderAsPrev && timeDiffPrev < 300000);

          const isSameSenderAsNext = nextMessage?.sender_id === message.sender_id;
          const timeDiffNext = nextMessage
            ? Math.abs(new Date(nextMessage.sent_at).getTime() - new Date(message.sent_at).getTime())
            : 0;
          const isLastInGroup = !nextMessage || !(isSameSenderAsNext && timeDiffNext < 300000);

          return (
            <Message
              message={message}
              key={message.id}
              isGrouped={isGrouped}
              isLastInGroup={isLastInGroup}
              isEditing={message.id === editingMessageId}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
              setIsEditing={(isEditing: boolean) => {
                if (isEditing) setEditingMessageId(message.id);
                else setEditingMessageId(null);
              }}
            />
          );
        })
      )}
    </div>
  );
}
