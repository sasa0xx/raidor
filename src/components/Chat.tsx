import { useHandleScroll } from "../hooks/useHandleScroll";
import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { ChatForm } from "./ChatForm";
import { useRef } from "react";

export function Chat() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useHandleScroll(messagesContainerRef);

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-100/50 dark:bg-gray-950 min-w-0 transition-colors duration-200">
      <ChatHeader />
      <MessagesList ref={messagesContainerRef} />
      <ChatForm />
    </main>
  );
}
