import { useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationListener() {
  const { toast } = useToast();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("to_user", "==", auth.currentUser.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();

          toast({
            title: "🔔 Notification",
            description: data.message,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
}
