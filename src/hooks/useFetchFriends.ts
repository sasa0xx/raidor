import { useEffect, useState } from "react";
import { type Card, type RawMessage, type RawProfile } from "../context/ChatContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useFetchFriends(friendsRef: React.RefObject<string[]>, usernameRef: React.RefObject<string>) {
  const [friendList, setFriendList] = useState<Card[]>([]);
  const { friends } = useAuth();

  useEffect(() => {
    console.log("FETCHING FRIENDS WITH:", friendsRef.current);
    const fetchStuff = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          username,
          id,
          sent:messages!sender_id(content, sent_at, sender:profiles!sender_id(username)),
          received:messages!receiver_id(content, sent_at, sender:profiles!sender_id(username))
        `)
        .in("id", friendsRef.current)
        .order("sent_at", { referencedTable: "sent", ascending: false })
        .limit(1, { referencedTable: "sent" })
        .order("sent_at", { referencedTable: "received", ascending: false })
        .limit(1, { referencedTable: "received" });

      if (error || !data) return;

      const profiles = data as unknown as RawProfile[];

      const cards: Card[] = profiles.map((profile) => {
        const lastSent = profile.sent[0];
        const lastReceived = profile.received[0];

        let latestMsg: RawMessage | null = null;
        if (lastSent && lastReceived) {
          latestMsg =
            new Date(lastSent.sent_at) > new Date(lastReceived.sent_at)
              ? lastSent
              : lastReceived;
        } else {
          latestMsg = lastSent || lastReceived || null;
        }

        const senderData = Array.isArray(latestMsg?.sender)
          ? latestMsg?.sender[0]
          : latestMsg?.sender;

        const sn = senderData?.username ?? "";

        return {
          id: profile.id,
          username: profile.username ?? "",
          sender: sn === usernameRef.current ? "You" : sn,
          lastMessage: latestMsg?.content ?? "",
        };
      });

      setFriendList(cards);
    };

    fetchStuff();
  }, [friends]);

  return friendList;
}
