import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Star, Zap, ArrowRight } from 'lucide-react';

const LEVEL_NAMES = [
  "",
  "Hydroelectric Dam",
  "Generator",
  "Transmission Lines",
  "Substation",
  "Home Entry",
  "Home Wiring",
  "Consumption"
];

export const GameHUD = () => {
  const { currentLevel, score, stars } = useGameStore();
  if (currentLevel === 0 || currentLevel === 8) return null;

  return (
    <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
      <div className="flex justify-between items-start px-5 pt-4">
        {/* Level info — top left */}
        <motion.div
          key={currentLevel}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <p className="text-blue-500 font-bold uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>
            LEVEL {currentLevel} OF 7
          </p>
          <h2 className="font-display font-bold text-slate-800 leading-tight" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)' }}>
            {LEVEL_NAMES[currentLevel]}
          </h2>
        </motion.div>

        {/* Score & Stars — top right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/90 rounded-full px-3 py-1.5 shadow-sm border border-slate-100">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-slate-700 text-sm">{stars}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/90 rounded-full px-3 py-1.5 shadow-sm border border-slate-100">
            <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <motion.span
              key={score}
              initial={{ scale: 1.4, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#334155' }}
              className="font-bold text-slate-700 text-sm"
            >
              {score}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VoltGuide = () => {
  const { voltMessage, currentLevel } = useGameStore();
  if (currentLevel === 0 || currentLevel === 8) return null;

  return (
    <div className="absolute bottom-5 left-5 z-40 flex items-end gap-3 pointer-events-none" style={{ maxWidth: '42%' }}>
      <motion.img
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        src={`${import.meta.env.BASE_URL}images/volt-robot.png`}
        alt="Volt"
        className="animate-float flex-shrink-0"
        style={{ width: 'clamp(48px, 5vw, 68px)', height: 'auto', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))' }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={voltMessage}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl rounded-bl-none shadow-lg mb-2 relative"
          style={{ padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 16px)' }}
        >
          <p className="font-bold text-blue-500 mb-0.5" style={{ fontSize: '0.65rem' }}>Volt says:</p>
          <p className="text-slate-700 font-medium leading-snug" style={{ fontSize: 'clamp(0.7rem, 1.1vw, 0.85rem)' }}>
            {voltMessage}
          </p>
          {/* triangle */}
          <div className="absolute -bottom-2.5 left-3 w-0 h-0"
            style={{ borderLeft: '10px solid transparent', borderRight: '0px solid transparent', borderTop: '10px solid white' }} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const NextLevelButton = () => {
  const { levelComplete, nextLevel, currentLevel } = useGameStore();
  if (currentLevel === 0 || currentLevel === 8) return null;

  const NEXT_LABELS: Record<number, string> = {
    1: 'Explore the Generator',
    2: 'See Transmission Lines',
    3: 'Visit the Substation',
    4: 'Enter the House',
    5: 'Wire the House',
    6: 'Power Appliances',
    7: 'See Final Results',
  };

  return (
    <AnimatePresence>
      {levelComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 pointer-events-none"
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-white/20" />

          {/* "Power generated!" badge — top center */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-yellow-100"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-slate-700 text-sm">Level Complete!</span>
          </motion.div>

          {/* Arrow button — bottom right */}
          <motion.button
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.35 }}
            whileHover={{ scale: 1.04, x: 4 }}
            whileTap={{ scale: 0.96 }}
            onClick={nextLevel}
            className="absolute bottom-5 right-5 pointer-events-auto flex items-center gap-2 text-white font-bold rounded-2xl shadow-xl"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)',
              padding: 'clamp(10px, 1.4vw, 14px) clamp(16px, 2.2vw, 24px)',
              fontSize: 'clamp(0.8rem, 1.3vw, 1rem)',
              boxShadow: '0 6px 24px rgba(59,130,246,0.4)',
            }}
          >
            {NEXT_LABELS[currentLevel] || 'Next Level'}
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const InfoCard = ({
  title,
  icon,
  colorClass = 'from-blue-500 to-cyan-400',
  borderColor = 'border-blue-100',
  children,
}: {
  title: string;
  icon?: string;
  colorClass?: string;
  borderColor?: string;
  children: React.ReactNode;
}) => (
  <div className={`bg-white rounded-2xl shadow-md border-2 ${borderColor} pointer-events-auto overflow-hidden`}>
    <div className={`bg-gradient-to-r ${colorClass} px-4 py-2.5 flex items-center gap-2`}>
      {icon && <span className="text-xl">{icon}</span>}
      <h3 className="font-display font-bold text-white" style={{ fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)' }}>
        {title}
      </h3>
    </div>
    <div className="p-4 text-slate-600 leading-relaxed space-y-2 font-sans" style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)' }}>
      {children}
    </div>
  </div>
);
