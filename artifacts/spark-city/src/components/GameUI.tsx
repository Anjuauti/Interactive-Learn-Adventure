import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Star, Zap, ChevronRight } from 'lucide-react';

const LEVEL_NAMES = [
  "", 
  "Hydroelectric", 
  "Generator", 
  "Transmission", 
  "Substation", 
  "Home Entry", 
  "Wiring", 
  "Consumption"
];

const LEVEL_COLORS = [
  "",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500"
];

export const GameHUD = () => {
  const { currentLevel, score, stars } = useGameStore();

  if (currentLevel === 0 || currentLevel === 8) return null;

  const progress = (currentLevel / 7) * 100;

  return (
    <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
      <div className="w-full bg-white border-b-2 border-slate-200 shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`${LEVEL_COLORS[currentLevel] || 'bg-slate-500'} text-white px-4 py-1 rounded-full font-display text-xl font-bold shadow-sm border border-white/20`}>
            Level {currentLevel}: {LEVEL_NAMES[currentLevel]}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-slate-800 font-display text-2xl font-bold">
            <Zap className="w-7 h-7 text-yellow-500 fill-yellow-500 animate-pulse" />
            <motion.span
              key={score}
              initial={{ scale: 1.5, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#1e293b' }}
            >
              {score} pts
            </motion.span>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-2xl flex gap-2 border border-slate-200">
            {[1, 2, 3].map((starIndex) => (
              <Star 
                key={starIndex} 
                className={`w-7 h-7 transition-all duration-500 ${
                  stars >= starIndex 
                    ? 'fill-yellow-500 text-yellow-500 scale-110 drop-shadow-sm' 
                    : 'text-slate-300 fill-slate-200'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-100">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-1000 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export const VoltGuide = () => {
  const { voltMessage, currentLevel } = useGameStore();

  if (currentLevel === 0 || currentLevel === 8) return null;

  return (
    <div className="absolute bottom-6 left-6 z-40 flex items-end gap-4 pointer-events-none max-w-xl">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-24 h-24 shrink-0 relative drop-shadow-lg"
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/volt-robot.png`} 
          alt="Volt Robot"
          className="w-full h-full object-contain animate-float"
        />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={voltMessage}
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: -20 }}
          className="relative bg-white p-4 rounded-2xl rounded-bl-none shadow-lg border-l-4 border-l-blue-500 mb-4"
        >
          <div className="absolute -left-4 bottom-0 w-0 h-0 border-t-[16px] border-t-transparent border-r-[16px] border-r-white border-b-[0px] border-b-transparent z-10" />
          <p className="text-lg font-medium text-slate-800 leading-relaxed">{voltMessage}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const NextLevelButton = () => {
  const { levelComplete, nextLevel } = useGameStore();

  return (
    <AnimatePresence>
      {levelComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
        >
          <motion.button
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextLevel}
            className="relative px-14 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-display font-bold text-3xl rounded-2xl shadow-xl flex items-center gap-4 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10">NEXT LEVEL</span>
            <ChevronRight className="w-10 h-10 relative z-10 animate-bounce" style={{ animationDirection: 'horizontal' }} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const InfoCard = ({ title, icon, colorClass = "from-blue-500 to-cyan-400", borderColor = "border-cyan-400", children }: { title: string, icon?: string, colorClass?: string, borderColor?: string, children: React.ReactNode }) => (
  <div className={`card-bright pointer-events-auto flex flex-col border-2 ${borderColor}`}>
    <div className={`bg-gradient-to-r ${colorClass} px-5 py-3 flex items-center gap-3`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-xl font-display text-white font-bold drop-shadow-sm">
        {title}
      </h3>
    </div>
    <div className="p-5 text-slate-700 text-base leading-relaxed space-y-3 font-sans font-medium">
      {children}
    </div>
  </div>
);