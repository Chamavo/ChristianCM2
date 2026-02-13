import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ModuleButtonProps {
  to?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  variant: "orthographe" | "maths" | "concentration" | "soon" | "english";
  delay?: number;
  inactive?: boolean;
}

const variantStyles = {
  orthographe: {
    gradient: "from-[#E65100] to-[#BF360C]", // Deep Orange 900
    shadow: "shadow-[0_20px_50px_-12px_rgba(230,81,0,0.5)]",
    border: "border-[#FF6D00]",
    iconBg: "bg-white/20",
  },
  maths: {
    gradient: "from-[#1565C0] to-[#0D47A1]", // Blue 800-900
    shadow: "shadow-[0_20px_50px_-12px_rgba(13,71,161,0.5)]",
    border: "border-[#2979FF]",
    iconBg: "bg-white/20",
  },
  concentration: {
    gradient: "from-[#7B1FA2] to-[#4A148C]", // Purple 700-900
    shadow: "shadow-[0_20px_50px_-12px_rgba(74,20,140,0.5)]",
    border: "border-[#AA00FF]",
    iconBg: "bg-white/20",
  },
  soon: {
    gradient: "from-slate-600 to-slate-800",
    shadow: "shadow-[0_20px_50px_-12px_rgba(30,41,59,0.5)]",
    border: "border-slate-500",
    iconBg: "bg-white/10",
  },
  english: {
    gradient: "from-[#CF142B] to-[#00247D]", // Red to Blue
    shadow: "shadow-[0_20px_50px_-12px_rgba(207,20,43,0.5)]",
    border: "border-white",
    iconBg: "bg-white/20",
  }
};

const ModuleButton = ({ to, icon: Icon, title, subtitle, variant, delay = 0, inactive = false }: ModuleButtonProps) => {
  const content = (
    <div
      className={`
        relative overflow-hidden rounded-[32px] p-10 flex flex-col items-center justify-center gap-6 
        text-white min-h-[300px] md:min-h-[400px] h-full bg-gradient-to-b ${variantStyles[variant].gradient} 
        ${variantStyles[variant].shadow} transition-all duration-300 border-[6px] ${variantStyles[variant].border}
        ${inactive ? 'opacity-60 cursor-not-allowed grayscale-[0.3]' : 'hover:brightness-110 active:scale-[0.98]'}
        group shimmer
      `}
      style={{
        boxShadow: `
          0 15px 35px rgba(0,0,0,0.15),
          0 10px 0 ${variant === 'orthographe' ? '#CC6E00' : variant === 'maths' ? '#1D5CC2' : variant === 'concentration' ? '#7B1FA2' : variant === 'english' ? '#011649' : '#64748b'},
          inset 0 -8px 0 rgba(0,0,0,0.1),
          inset 0 8px 0 rgba(255,255,255,0.2)
        `
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <motion.div
          className={`rounded-full ${variantStyles[variant].iconBg} p-6 backdrop-blur-md floating-icon shadow-inner`}
        >
          <Icon className="w-14 h-14 md:w-20 md:h-20 drop-shadow-lg" strokeWidth={2.5} />
        </motion.div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{title}</h2>
          <p className="text-xl font-bold text-white/90 drop-shadow-sm">{subtitle}</p>
        </div>
      </div>

      {inactive && (
        <span className="mt-auto inline-block px-4 py-1.5 bg-black/20 rounded-full text-xs font-black uppercase tracking-widest translate-y-2">
          {variant === 'english' || title.toLowerCase() === 'english' ? 'Coming Soon 🔒' : 'À venir 🔒'}
        </span>
      )}

      {/* Glossy overlay effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      whileHover={inactive ? {} : {
        y: -12,
        scale: 1.05,
      }}
      whileTap={inactive ? {} : { y: 4 }}
    >
      {!inactive && to ? (
        <Link to={to} className="flex flex-col h-full">{content}</Link>
      ) : (
        <div className="flex flex-col h-full">{content}</div>
      )}
    </motion.div>
  );
};

export default ModuleButton;
