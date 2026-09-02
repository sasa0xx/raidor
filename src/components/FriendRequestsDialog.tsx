import { Button } from "./Button"
import { useState, useRef, useEffect } from "react"
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function FriendRequestsDialog() {
  const { user, refreshFriends } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("friend_requests")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        sender:profiles!sender_id(id, username, display_name, avatar_path),
        receiver:profiles!receiver_id(id, username, display_name, avatar_path)
      `)
      .eq("status", "pending");

    if (!error && data) {
      setRequests(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      fetchRequests();
      if (newStatus === "accepted") refreshFriends();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchRequests();
    }
  };

  const incomingRequests = requests.filter(r => r.receiver_id === user?.id);
  const outgoingRequests = requests.filter(r => r.sender_id === user?.id);
  const displayRequests = activeTab === "incoming" ? incomingRequests : outgoingRequests;

  return (
    <dialog
      id="friendRequests"
      closedby="any"
      ref={dialogRef}
      onAnimationStart={fetchRequests}
      className="m-auto rounded-2xl border p-4 shadow-2xl bg-white text-slate-900 border-slate-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white backdrop:bg-black/60 backdrop:backdrop-blur-xs backdrop:z-50"
    >
      <div className="w-96 flex flex-col min-h-75" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Friend Requests</h3>
          <Button varient="ghost" className="px-2 py-1 border-0 hover:bg-slate-100 dark:hover:bg-gray-800" command="close" commandFor="friendRequests">
            ✕
          </Button>
        </div>

        <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-gray-800 rounded-lg">
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "incoming" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming ({incomingRequests.length})
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "outgoing" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("outgoing")}
          >
            Sent ({outgoingRequests.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <p className="text-center text-sm text-slate-500 mt-8">Loading...</p>
          ) : displayRequests.length === 0 ? (
            <p className="text-center text-sm text-slate-500 mt-8">No {activeTab} requests.</p>
          ) : (
            displayRequests.map((req) => {
              const otherUser = activeTab === "incoming" ? req.sender : req.receiver;
              const profile = Array.isArray(otherUser) ? otherUser[0] : otherUser;

              return (
                <div key={req.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white shrink-0 text-xs">
                      {profile.avatar_path ? (
                        <img src={profile.avatar_path} alt="avatar" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        profile.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{profile?.display_name || profile?.username}</p>
                      <p className="text-xs text-slate-500 truncate">@{profile?.username}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0 ml-2">
                    {activeTab === "incoming" ? (
                      <>
                        <Button varient="ghost" className="px-2! py-1! text-xs text-gray-800 border-gray-800 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-200 dark:border-gray-200 dark:hover:bg-gray-950/30 dark:hover:text-gray-200" onClick={() => handleUpdateStatus(req.id, "accepted")}>Accept</Button>
                        <Button varient="ghost" className="px-2! py-1! text-xs text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 focus-visible:ring-red-500" onClick={() => handleUpdateStatus(req.id, "rejected")}>Reject</Button>
                      </>
                    ) : (
                      <Button varient="ghost" className="px-2! py-1! border-0! text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDeleteRequest(req.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </dialog>
  )
}
