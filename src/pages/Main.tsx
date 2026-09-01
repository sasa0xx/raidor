import { Sidebar } from "../components/Sidebar"
import { Chat } from "../components/Chat"
import { AddFriendDialog } from "../components/AddFriendDialog";
import { ProfileDialog } from "../components/ProfileDialog";
import { FriendRequestsDialog } from "../components/FriendRequestsDialog";


export function Main() {
  return (
    <div>
      <AddFriendDialog />
      <ProfileDialog />
      <FriendRequestsDialog />
      <div className="h-dvh w-screen overflow-hidden flex bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
}
