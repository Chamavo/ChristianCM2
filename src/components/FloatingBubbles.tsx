import { motion } from "framer-motion";

const bubbles = [
  { size: 100, x: "5%", y: "15%", delay: 0, color: "rgba(255, 138, 0, 0.1)" },    // Orange
  { size: 140, x: "80%", y: "10%", delay: 1, color: "rgba(41, 121, 255, 0.1)" },   // Blue
  { size: 180, x: "70%", y: "65%", delay: 2, color: "rgba(156, 39, 176, 0.1)" },   // Purple
  { size: 120, x: "12%", y: "80%", delay: 0.5, color: "rgba(0, 200, 83, 0.1)" },   // Green
  { size: 80, x: "45%", y: "5%", delay: 1.5, color: "rgba(41, 121, 255, 0.08)" },  // Blue Light
  { size: 90, x: "25%", y: "45%", delay: 2.5, color: "rgba(255, 138, 0, 0.12)" },  // Orange Vibrant
  { size: 110, x: "60%", y: "85%", delay: 3, color: "rgba(156, 39, 176, 0.05)" },  // Purple Fade
];

const FloatingBubbles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-[2px] shadow-inner"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.x,
            top: bubble.y,
            backgroundColor: bubble.color,
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 8 + index,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBubbles;
