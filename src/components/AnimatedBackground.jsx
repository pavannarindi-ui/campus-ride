import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      {/* GRADIENT BLOB 1 */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl top-10 left-10"
      />

      {/* GRADIENT BLOB 2 */}
      <motion.div
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ repeat: Infinity, duration: 15 }}
        className="absolute w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl bottom-10 right-10"
      />

    </div>
  );
}