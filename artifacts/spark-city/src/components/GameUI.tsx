import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Star, Zap, ChevronRight } from 'lucide-react';

const LEVEL_NAMES = [
  "", 
  "Hydroelectric Dam", 
  "Generator", 
  "Transmission", 
  "Substation", 
  "Home Entry", 
  "Wiring", 
  "Consumption"
];

const LEVEL_GRADIENTS = [
  "",
  "from-blue-500 to-cyan-400",
  "from-yellow-400 to-orange-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-400",
  "from-indigo-500 to-purple-500",
  "from-red-500 to-orange-500",
  "from-cyan-500 to-blue-600"
];

export const GameHUD = () => {
  const { currentLevel, score, stars } = useGameStore();

  if (currentLevel === 0 || currentLevel === 8) return null;

  const progress = (currentLevel / 7) * 100;

  return (
    <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
      <div className="w-full bg-slate-900/60 backdrop-blur-xl border-b-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-r ${LEVEL_GRADIENTS[currentLevel] || 'from-slate-500 to-slate-400'} text-white px-5 py-2 rounded-xl font-display text-xl font-bold shadow-lg border border-white/20`}>
            Level {currentLevel}: {LEVEL_NAMES[currentLevel]}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-yellow-400 font-display text-3xl font-bold drop-shadow-[0_0_10px_rgba(255,204,0,0.8)]">
            <Zap className="w-8 h-8 fill-yellow-400 animate-pulse" />
            <motion.span
              key={score}
              initial={{ scale: 1.5, color: '#fff' }}
              animate={{ scale: 1, color: '#facc15' }}
            >
              {score} pts
            </motion.span>
          </div>

          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl flex gap-2 border border-slate-600/50">
            {[1, 2, 3].map((starIndex) => (
              <Star 
                key={starIndex} 
                className={`w-8 h-8 transition-all duration-500 ${
                  stars >= starIndex 
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,204,0,1)] scale-110' 
                    : 'text-slate-600 fill-slate-800'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.8)] relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff]" />
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
        className="w-40 h-40 shrink-0 relative drop-shadow-2xl"
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
          className="relative bg-white/95 backdrop-blur-md p-6 rounded-3xl rounded-bl-none border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)] mb-8"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-400 to-blue-500 rounded-l-2xl" />
          <div className="absolute -left-5 bottom-0 w-0 h-0 border-t-[20px] border-t-transparent border-r-[24px] border-r-cyan-400 border-b-[0px] border-b-transparent" />
          <div className="absolute -left-4 bottom-1 w-0 h-0 border-t-[16px] border-t-transparent border-r-[20px] border-r-white border-b-[0px] border-b-transparent z-10" />
          <p className="text-xl font-display text-slate-800 leading-relaxed font-bold pl-2">{voltMessage}</p>
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-orange-500 blur-xl"
            />
            <motion.button
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextLevel}
              className="relative px-14 py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-display font-bold text-4xl rounded-full shadow-[0_0_40px_rgba(255,165,0,0.8)] flex items-center gap-4 border-4 border-yellow-200 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 drop-shadow-md">NEXT LEVEL</span>
              <ChevronRight className="w-10 h-10 relative z-10 animate-bounce" style={{ animationDirection: 'horizontal' }} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const InfoCard = ({ title, icon, colorClass = "from-blue-500 to-cyan-400", borderColor = "border-cyan-400", children }: { title: string, icon?: string, colorClass?: string, borderColor?: string, children: React.ReactNode }) => (
  <div className={`card-bright pointer-events-auto flex flex-col border-2 ${borderColor}`}>
    <div className={`bg-gradient-to-r ${colorClass} px-5 py-3 flex items-center gap-3`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-xl font-display text-white font-bold drop-shadow-md">
        {title}
      </h3>
    </div>
    <div className="p-5 text-slate-700 text-base leading-relaxed space-y-3 font-sans font-medium">
      {children}
    </div>
  </div>
);
