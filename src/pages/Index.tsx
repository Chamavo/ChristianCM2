import { motion } from "framer-motion";
import { Pencil, Calculator, Brain, Sparkles } from "lucide-react";
import FloatingBubbles from "@/components/FloatingBubbles";
import WelcomeHeader from "@/components/WelcomeHeader";
import ModuleButton from "@/components/ModuleButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <FloatingBubbles />

      <main className="relative z-10 container py-10 px-4 max-w-6xl mx-auto flex flex-col items-center">
        <section className="w-full flex flex-col items-center text-center">
          <WelcomeHeader />



          {/* Activity Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full px-4 relative z-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <ModuleButton
              icon={Pencil}
              title="Français"
              subtitle="Le pouvoir des mots"
              variant="orthographe"
              delay={0.5}
              to="/francais"
            />

            <ModuleButton
              icon={Calculator}
              title="Mathématiques"
              subtitle="L'art des nombres"
              variant="maths"
              delay={0.6}
              to="/mathematiques"
            />

            <ModuleButton
              icon={Brain}
              title="Concentration"
              subtitle="Force de l'esprit"
              variant="concentration"
              delay={0.7}
              to="/concentration"
              inactive={false}
            />
          </motion.div>


        </section>
      </main>
    </div>
  );
};

export default Index;
