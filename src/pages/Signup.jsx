import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 🔥 Create Firestore user profile
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        trust_score: 5,
        created_at: serverTimestamp(),
      });

      alert("Account Created Successfully 🚀");
      navigate("/home");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center text-white">
      <form
        onSubmit={handleSignup}
        className="bg-gray-900 p-8 rounded-2xl w-96 border border-cyan-500/30"
      >
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full p-3 mb-3 bg-black rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Phone Number"
          required
          className="w-full p-3 mb-3 bg-black rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full p-3 mb-3 bg-black rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full p-3 mb-3 bg-black rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {/* ROLE SELECTION */}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "student" })}
            className={`flex-1 py-2 rounded-lg ${
              formData.role === "student"
                ? "bg-cyan-500"
                : "bg-gray-700"
            }`}
          >
            Student 🎓
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "driver" })}
            className={`flex-1 py-2 rounded-lg ${
              formData.role === "driver"
                ? "bg-pink-500"
                : "bg-gray-700"
            }`}
          >
            Driver 🚗
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}