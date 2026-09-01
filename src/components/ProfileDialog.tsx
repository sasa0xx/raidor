import { Button } from "./Button"
import { useState, useRef, useEffect } from "react"
import { Input } from "./Input";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function ProfileDialog() {
  const { user, profile, refreshFriends } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
      })
      .eq("id", user.id);

    if (!error) {
      refreshFriends();
      dialogRef.current?.close();
    } else {
      console.error("Failed to save profile:", error);
    }

    setIsSaving(false);
  };

  return (
    <dialog
      id="profileDialog"
      closedby="any"
      ref={dialogRef}
      className="m-auto rounded-2xl border p-4 shadow-2xl bg-white text-slate-900 border-slate-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white backdrop:bg-black/60 backdrop:backdrop-blur-xs backdrop:z-50"
    >
      <div className="w-80 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Edit Profile</h3>
          <Button
            varient="ghost"
            className="px-2 py-1 border-0 hover:bg-slate-100 dark:hover:bg-gray-800"
            command="close"
            commandFor="profileDialog"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <p className="text-sm text-slate-700 dark:text-gray-100 mb-1">Display Name</p>
            <Input
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm text-slate-700 dark:text-gray-100 mb-1">Bio</p>
            <Input
              placeholder="Tell people about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <Button varient="secondary" type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </dialog>
  );
}
