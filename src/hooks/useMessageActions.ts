import { useState } from "react";
import { useChat, type Message } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export function useMessageActions(message: Message) {
  const { setMessages } = useChat();
  const { user } = useAuth();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");

  const isMe = message.sender_id === user?.id;
  const isEditing = isMe && editingMessageId === message.id;

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

  return { isMe, isEditing, editMessage, deleteMessage, editingContent, setEditingContent, setEditingMessageId };
}
