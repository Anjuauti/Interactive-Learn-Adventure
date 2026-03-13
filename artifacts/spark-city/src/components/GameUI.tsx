import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Star, Zap, ChevronRight, Info } from 'lucide-react';

export const GameHUD = () => {
  const { currentLevel, score, stars } = useGameStore();

  if (currentLevel === 0 || currentLevel === 8) return null;

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-40 pointer-events-none">
      <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
        <div className="bg-blue-600/50 text-blue-200 px-3 py-1 rounded-lg font-display text-xl border border-blue-500/30">
          Level {currentLevel}
        </div>
        <div className="flex items-center gap-2 text-yellow-400 font-display text-2xl">
          <Zap className="fill-yellow-400 animate-pulse" />
          {score} pts
        </div>
      </div>

      <div className="glass-panel px-4 py-3 rounded-2xl flex gap-2">
        {[1, 2, 3].map((starIndex) => (
          <Star 
            key={starIndex} 
            className={`w-8 h-8 transition-all duration-500 ${
              stars >= starIndex 
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,204,0,0.8)] scale-110' 
                : 'text-slate-600'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export const VoltGuide = () => {
  const { voltMessage, currentLevel } = useGameStore();

  if (currentLevel === 0 || currentLevel === 8) return null;

  return (
    <div className="absolute bottom-6 left-6 z-40 flex items-end gap-6 pointer-events-none max-w-lg">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-32 h-32 relative"
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/volt-robot.png`} 
          alt="Volt Robot"
          className="w-full h-full object-contain animate-bounce"
          style={{ animationDuration: '3s' }}
        />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={voltMessage}
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: -20 }}
          className="glass-panel p-5 rounded-3xl rounded-bl-none mb-8 border-l-4 border-l-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
        >
          <p className="text-xl font-display text-white leading-relaxed">{voltMessage}</p>
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
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextLevel}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-display font-bold text-2xl rounded-full glow-yellow flex items-center gap-3"
        >
          NEXT LEVEL
          <ChevronRight className="w-8 h-8" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="glass-panel p-6 rounded-2xl max-w-sm pointer-events-auto border-t-4 border-t-blue-400">
    <h3 className="text-xl font-display text-blue-300 mb-3 flex items-center gap-2">
      <Info className="w-5 h-5" />
      {title}
    </h3>
    <div className="text-slate-300 text-sm leading-relaxed space-y-2 font-sans">
      {children}
    </div>
  </div>
);
