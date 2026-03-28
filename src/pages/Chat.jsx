import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

/* -------- TRANSLATION FUNCTION -------- */
async function translateText(text, targetLang) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${targetLang}`
    );
    const data = await res.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // fallback
  }
}

export default function Chat() {

  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* -------- TEMP LANG (later from profile) -------- */
  const senderLanguage = "en";
  const receiverLanguage = "ta"; // tamil example

  /* -------- FETCH MESSAGES -------- */
  useEffect(() => {

    const q = query(
      collection(db, "rides", id, "messages"),
      orderBy("created_at")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();

  }, [id]);

  /* -------- SEND MESSAGE -------- */
  const sendMessage = async () => {

    if (!text.trim()) return;

    try {

      /* TRANSLATE */
      const translated = await translateText(text, receiverLanguage);

      /* SAVE MESSAGE */
      await addDoc(collection(db, "rides", id, "messages"), {
        original_text: text,
        translated_text: translated,
        sender: auth.currentUser.uid,
        sender_lang: senderLanguage,
        receiver_lang: receiverLanguage,
        created_at: serverTimestamp(),
      });

      setText("");

    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        💬 Ride Chat (Auto Translate 🌍)
      </h1>

      {/* CHAT BOX */}
      <div className="bg-gray-900 p-6 rounded-xl h-96 overflow-y-auto mb-4">

        {messages.map((msg) => (

          <div key={msg.id} className="mb-3">

            <span className="text-cyan-400 font-semibold">
              {msg.sender === auth.currentUser.uid ? "You" : "User"}:
            </span>

            <p className="ml-2">
              {msg.translated_text || msg.original_text}
            </p>

            {/* OPTIONAL: show original */}
            {msg.original_text !== msg.translated_text && (
              <p className="text-xs text-gray-400 ml-2">
                ({msg.original_text})
              </p>
            )}

          </div>

        ))}

      </div>

      {/* INPUT */}
      <div className="flex gap-3">

        <input
          className="flex-1 p-3 bg-gray-800 rounded-xl outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-cyan-500 to-pink-500 px-6 rounded-xl hover:scale-105 transition"
        >
          Send
        </button>

      </div>

    </div>
  );
}