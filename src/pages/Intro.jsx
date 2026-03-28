import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold">
        🚗 Campus Ride
      </h1>
    </div>
  );
}
