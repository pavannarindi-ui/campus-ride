import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState(""); // must choose
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [license, setLicense] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  const handleAuth = async () => {
    try {

      if (!role) {
        alert("⚠️ Please select Student or Driver");
        return;
      }

      // =============================
      // STUDENT VALIDATION
      // =============================
      if (role === "student") {
        if (!email.endsWith("@vitstudent.ac.in")) {
          alert("❌ Only VIT email allowed for students");
          return;
        }
      }

      // =============================
      // DRIVER VALIDATION (SIGNUP ONLY)
      // =============================
      if (role === "driver" && isSignup) {
        if (!license || !aadhaar) {
          alert("⚠️ Drivers must enter License & Aadhaar");
          return;
        }
      }

      let userCredential;

      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          role,
          license: role === "driver" ? license : null,
          aadhaar: role === "driver" ? aadhaar : null,
          created_at: new Date()
        });

        alert("Signup successful 🎉");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 🔥 CHECK ROLE MATCH DURING LOGIN
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

        if (!userDoc.exists()) {
          alert("User role not found");
          return;
        }

        const userData = userDoc.data();

        if (userData.role !== role) {
          alert("❌ Wrong role selected");
          return;
        }

        alert("Login successful 🚀");
      }

      navigate("/home");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-gray-900 p-10 rounded-2xl border border-cyan-500/30 shadow-2xl w-full max-w-md">

        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {/* ROLE SELECTION */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-2 rounded-lg ${
              role === "student"
                ? "bg-gradient-to-r from-cyan-500 to-pink-500"
                : "bg-gray-800"
            }`}
          >
            Student 🎓
          </button>

          <button
            onClick={() => setRole("driver")}
            className={`flex-1 py-2 rounded-lg ${
              role === "driver"
                ? "bg-gradient-to-r from-cyan-500 to-pink-500"
                : "bg-gray-800"
            }`}
          >
            Driver 🚗
          </button>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder={
            role === "student"
              ? "yourname@vit.ac.in"
              : "Enter Email"
          }
          className="w-full mb-4 p-3 rounded-lg bg-black border border-cyan-500/40"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-cyan-500/40"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* DRIVER EXTRA FIELDS (ONLY DURING SIGNUP) */}
        {role === "driver" && isSignup && (
          <>
            <input
              type="text"
              placeholder="Driving License Number"
              className="w-full mb-4 p-3 rounded-lg bg-black border border-pink-500/40"
              onChange={(e) => setLicense(e.target.value)}
            />

            <input
              type="text"
              placeholder="Aadhaar Number"
              className="w-full mb-4 p-3 rounded-lg bg-black border border-pink-500/40"
              onChange={(e) => setAadhaar(e.target.value)}
            />
          </>
        )}

        <button
          onClick={handleAuth}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:scale-105 transition"
        >
          {isSignup ? "Sign Up 🚀" : "Login 🚗"}
        </button>

        <p className="text-center mt-6 text-gray-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyan-400 cursor-pointer ml-2"
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>

      </div>
    </div>
  );
}