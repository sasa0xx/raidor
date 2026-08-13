import { Button } from "./Button"
import { useState, useRef } from "react"
import { Input } from "./Input";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function AddFriendDialog() {
  const [windowError, setWindowError] = useState("");
  const [windowUsername, setWindowUsername] = useState("");
  const { user, username, refreshFriends } = useAuth();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleAddFriend = (e: React.SubmitEvent) => {
    e.preventDefault();

    const addFriend = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", windowUsername)
        .single();

      if (error || !data) {
        setWindowError("Cannot find a user with that username.");
        return;
      }
      await supabase.from("messages").insert({
        sender_id: user?.id,
        receiver_id: data.id,
        content: `${username} Started the conversation`,
      });

      refreshFriends();
      dialogRef.current?.close();
    };

    addFriend();
  };

  return (
    <dialog
      id="addFriend"
      closedby="any"
      ref={dialogRef}
      className="m-auto rounded-2xl border p-4 shadow-2xl bg-white text-slate-900 border-slate-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white backdrop:bg-black/60 backdrop:backdrop-blur-xs backdrop:z-50"
    >
      <div
        className="w-80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Add friend</h3>
          <Button
            varient="ghost"
            className="px-2 py-1 border-0 hover:bg-slate-100 dark:hover:bg-gray-800"
            command="close"
            commandFor="addFriend"
          >
            ✕
          </Button>
        </div>

        {windowError && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
            {windowError}
          </div>
        )}
        <form onSubmit={handleAddFriend}>
          <p className="text-sm text-slate-700 dark:text-gray-100 mb-2">username</p>
          <Input
            placeholder="username"
            value={windowUsername}
            onChange={(e) => setWindowUsername(e.target.value)}
          />
          <Button
            varient="secondary"
            type="submit"
            className="mt-4 w-full"
          >
            Add friend
          </Button>
        </form>
      </div>

    </dialog>
  )
}
