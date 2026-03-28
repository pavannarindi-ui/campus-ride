import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        alert("Login Successful 🚀");
      } else {
        await createUserWithEmailAndPassword(auth, form.email, form.password);
        alert("Account Created 🎉");
      }

      navigate("/home");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-20 blur-3xl animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-gray-900/80 border border-cyan-500/30 shadow-2xl backdrop-blur-xl"
      >

        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          {isLogin ? "Welcome Back 🚗" : "Join Campus Ride 🚀"}
        </h1>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-l-full ${
              isLogin ? "bg-cyan-500 text-black" : "bg-gray-700"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-r-full ${
              !isLogin ? "bg-pink-500 text-black" : "bg-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 p-3 rounded-xl bg-black border border-cyan-500/40"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-xl bg-black border border-cyan-500/40"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 rounded-xl bg-black border border-cyan-500/40"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-bold hover:scale-105 transition"
        >
          {loading
            ? "Processing..."
            : isLogin
            ? "Login 🚀"
            : "Create Account 🎉"}
        </button>
      </motion.div>
    </div>
  );
}
