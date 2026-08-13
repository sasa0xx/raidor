import { Sidebar } from "../components/Sidebar"
import { Chat } from "../components/Chat"
import { AddFriendDialog } from "../components/AddFriendDialog";


export function Main() {
  return (
    <div>
      <AddFriendDialog />
      <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
}
