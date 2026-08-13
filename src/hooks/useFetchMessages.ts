import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { type Message } from "../context/ChatContext";

export function useFetchMessages(selectedUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`receiver_id.eq.${selectedUserId},sender_id.eq.${selectedUserId}`);

      if (data && !error) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  return { messages, setMessages };
}
