import { FiMenu } from "react-icons/fi";
import { Button } from "./Button";
import { useChat } from "../context/ChatContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

export function ChatHeader() {
  const { setIsSidebarOpen, friendList, selectedUserId } = useChat();

  const onlineUsers = useOnlineUsers();
  const activeFriend = friendList.find((f) => f.id === selectedUserId);
  const isActiveFriendOnline =
    activeFriend && onlineUsers.includes(activeFriend.id);

  return (
    <header className="shrink-0 px-4 py-3.5 bg-white border-b border-slate-200 dark:bg-gray-900 dark:border-gray-800/80 flex items-center gap-x-3 shadow-xs">
      <Button
        varient="ghost"
        className="md:hidden p-2 border-0 hover:bg-slate-100 text-slate-600 dark:hover:bg-gray-800 dark:text-gray-300"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FiMenu size={20} />
      </Button>

      {activeFriend ? (
        <div className="flex items-center gap-x-3.5">
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
            {activeFriend.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-sm text-slate-900 dark:text-gray-100">
              {activeFriend.username}
            </h2>
            <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
              {isActiveFriendOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 md:hidden">
          Conversations
        </span>
      )}
    </header>

  )
}
