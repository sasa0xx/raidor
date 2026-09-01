import { Button } from "./Button"
import { useState, useRef, useEffect } from "react"
import { Input } from "./Input";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FaCamera } from "react-icons/fa"; // Make sure to import an icon!

export function ProfileDialog() {
  const { user, profile, refreshFriends } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_path || "");
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    setAvatarUrl(data.publicUrl);
    setIsUploading(false);
  };

  const handleSaveProfile = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
        avatar_path: avatarUrl,
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
          <Button varient="ghost" className="px-2 py-1 border-0" command="close" commandFor="profileDialog">✕</Button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center mb-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 w-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden group cursor-pointer border-2 border-transparent hover:border-violet-400 transition-all"
              disabled={isUploading}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                profile?.username?.[0]?.toUpperCase() || "?"
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <span className="text-xs">...</span> : <FaCamera size={20} />}
              </div>
            </button>
            <p className="text-xs text-slate-500 mt-2">Click to change avatar</p>
          </div>

          <div>
            <p className="text-sm text-slate-700 dark:text-gray-100 mb-1">Display Name</p>
            <Input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div>
            <p className="text-sm text-slate-700 dark:text-gray-100 mb-1">Bio</p>
            <Input placeholder="Tell people about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <Button varient="secondary" type="submit" className="w-full mt-2" disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </dialog>
  );
}
