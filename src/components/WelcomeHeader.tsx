import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

const WelcomeHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-center mb-12"
    >
      <motion.div
        className="inline-flex items-center gap-3 mb-6"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-10 h-10 text-[#FFD700] filter drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="w-12 h-12 text-[#FFD700] fill-[#FFD700] filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
        </motion.div>
        <Sparkles className="w-10 h-10 text-[#FFD700] filter drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
      </motion.div>

      <motion.h1
        className="text-5xl md:text-7xl font-black text-slate-800 mb-6 tracking-tight leading-tight"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        Bienvenue chez <br />
        <span className="text-gradient-christian">Christian</span> ! 🏎️
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-2xl text-slate-500 max-w-2xl mx-auto font-medium"
      >
        Choisis ton circuit et lance la course ! 🏁
      </motion.p>
    </motion.div>
  );
};

export default WelcomeHeader;
