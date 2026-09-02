import { useRef } from "react";
import { Button } from "./Button";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export function FriendProfileDialog() {
  const { friendList, selectedUserId, setSelectedUserId } = useChat();
  const { user, refreshFriends } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const activeFriend = friendList.find((f) => f.id === selectedUserId);

  const handleUnfriend = async () => {
    if (!user || !activeFriend) return;

    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeFriend.id}),and(sender_id.eq.${activeFriend.id},receiver_id.eq.${user.id})`);

    if (!error) {
      dialogRef.current?.close();
      setSelectedUserId(null);
      refreshFriends();
    } else {
      console.error("Failed to unfriend:", error);
    }
  };

  if (!activeFriend) return null;

  return (
    <dialog
      id="friendProfile"
      ref={dialogRef}
      closedby="any"
      className="m-auto rounded-2xl border p-6 shadow-2xl bg-white text-slate-900 border-slate-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white backdrop:bg-black/60 backdrop:backdrop-blur-xs backdrop:z-50"
    >
      <div className="w-80 flex flex-col items-center text-center">
        <div className="w-full flex justify-end mb-2">
          <Button varient="ghost" className="px-2 py-1 border-0" onClick={() => dialogRef.current?.close()}>
            ✕
          </Button>
        </div>

        <div className="h-24 w-24 rounded-full bg-violet-600 flex items-center justify-center font-bold text-3xl text-white mb-4 overflow-hidden shadow-md">
          {activeFriend.avatar_path ? (
            <img src={activeFriend.avatar_path} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            activeFriend.display_name.charAt(0).toUpperCase()
          )}
        </div>

        <h3 className="font-bold text-xl mb-1">{activeFriend.display_name}</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">@{activeFriend.display_name}</p>

        <div className="w-full bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left border border-slate-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1 uppercase tracking-wider">About Me</p>
          <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
            {activeFriend.bio || "This user hasn't written a bio yet."}
          </p>
        </div>

        <Button
          varient="ghost"
          className="w-full text-red-500 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 focus-visible:ring-red-500"
          onClick={handleUnfriend}
        >
          Remove Friend
        </Button>
      </div>
    </dialog>
  );
}
