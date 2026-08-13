import { useEffect } from "react";
import { useChat } from "../context/ChatContext";

export function useHandleScroll(messagesContainerRef: React.RefObject<HTMLDivElement | null>) {
  const { messages } = useChat();

  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

}
