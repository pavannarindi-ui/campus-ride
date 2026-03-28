import { useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroAnimation({ onComplete }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">

      {/* Moving Car */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 300 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="text-6xl"
      >
        🚗
      </motion.div>

      {/* Loading Text */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 text-cyan-400 text-xl"
      >
        Loading Campus Ride...
      </motion.h1>

    </div>
  );
}