import { Button } from "./Button.tsx"
import { Input } from "./Input.tsx"
import { useState } from "react"
import { FaUserPlus, FaBell } from "react-icons/fa";
import { FiSun, FiMoon, FiX } from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext.tsx";

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, friendList, setSelectedUserId, selectedUserId } = useChat();
  const { theme, setTheme, profile } = useAuth();
  const [filter, setFilter] = useState("");

  const username = profile?.username;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 dark:bg-gray-900 dark:border-gray-800/80 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-gray-800">
          <Button
            varient="ghost"
            className="flex gap-x-2.5 items-center small-btn p-2!"
            commandFor="profileDialog"
            command="show-modal"
            title="Edit Profile"
          >
            <div className="h-9 w-9 rounded-2xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0 overflow-hidden">
              {profile?.avatar_path ? (
                <img src={profile.avatar_path} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                username ? username[0]?.toUpperCase() : "?"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-gray-100 truncate">
                {profile?.display_name || username}
              </p>
            </div>
          </Button>

          <div className="flex items-center gap-x-1">
            <Button
              varient="ghost"
              className="small-btn"
              onClick={() => setTheme?.(theme === "dark" ? "light" : "dark")}
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <FiSun size={18} className="text-amber-400" />
              ) : (
                <FiMoon size={18} />
              )}
            </Button>

            <Button
              varient="ghost"
              className="small-btn"
              commandFor="friendRequests"
              command="show-modal"
              title="Friend Requests"
            >
              <FaBell size={18} />
            </Button>

            <Button
              varient="ghost"
              className="small-btn"
              commandFor="addFriend"
              command="show-modal"
            >
              <FaUserPlus size={18} />
            </Button>

            <Button
              varient="ghost"
              className="small-btn md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiX size={18} />
            </Button>
          </div>
        </div>

        <div className="p-3">
          <Input
            className="py-1.5"
            placeholder="Search conversations"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {friendList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 dark:text-gray-500">
              No conversations yet
            </div>
          ) : (
            friendList
              .filter((f) => f.display_name.toLowerCase().includes(filter.toLowerCase()))
              .map((chat) => {
                const isSelected = chat.id === selectedUserId;
                return (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-x-3 p-2.5 rounded-xl transition-all cursor-pointer group ${isSelected
                      ? "bg-slate-200 text-slate-900 dark:bg-gray-800 dark:text-white font-medium"
                      : "hover:bg-slate-100 text-slate-700 dark:hover:bg-gray-800/50 dark:text-gray-300"
                      }`}
                    onClick={() => {
                      setSelectedUserId(chat.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-linear-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-gray-100 font-bold text-sm shadow-sm overflow-hidden">
                      {chat.avatar_path ? (
                        <img src={chat.avatar_path} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        chat.display_name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-semibold truncate">
                          {chat.display_name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                        {chat.lastMessage ? (
                          <>
                            <span className="font-medium text-slate-700 dark:text-gray-300">
                              {chat.sender}:
                            </span>{" "}
                            {chat.lastMessage}
                          </>
                        ) : (
                          <span className="italic text-slate-400 dark:text-gray-500">
                            No messages yet
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </aside>
    </>
  )
}
