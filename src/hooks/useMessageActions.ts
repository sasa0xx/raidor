import { useChat, type Message } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export function useMessageActions(
  message: Message,
  isEditing: boolean,
  editingContent: string,
  setIsEditing: (isEditing: boolean) => void,
  setEditingContent: (edtingContent: string) => void
) {
  const { setMessages, replyId, setReplyId } = useChat();
  const { user } = useAuth();

  const isMe = message.sender_id === user?.id;
  const isReplyTarget = replyId === message.id;

  const deleteMessage = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", message.id)
      .eq("sender_id", user.id);

    if (error) {
      console.error("Failed to delete message:", error);
      return;
    }

    setMessages((prev) =>
      prev.filter((m) => m.id !== message.id)
    );
  };

  const editMessage = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!user || !isEditing || !editingContent.trim()) return;

    const { data, error } = await supabase
      .from("messages")
      .update({
        content: editingContent.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq("id", message.id)
      .eq("sender_id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to edit message:", error);
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? data : m
      )
    );

    setIsEditing(false);
    setEditingContent("");
  };

  const setReplyTarget = () => {
    setReplyId(message.id);
  }

  return { isMe, editMessage, deleteMessage, isReplyTarget, setReplyTarget };
}
