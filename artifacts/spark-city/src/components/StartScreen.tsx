import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Play, Zap } from 'lucide-react';

export const StartScreen = () => {
  const { setLevel } = useGameStore();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image injected via CSS in base, here just overlays */}
      <img 
        src={`${import.meta.env.BASE_URL}images/spark-bg.png`} 
        alt="Spark City Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] to-transparent z-0" />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="z-10 text-center mb-12"
      >
        <Zap className="w-24 h-24 mx-auto text-yellow-400 fill-yellow-400 glow-yellow mb-6" />
        <h1 className="text-7xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] leading-tight">
          SPARK CITY
        </h1>
        <h2 className="text-3xl md:text-4xl font-display text-yellow-400 mt-2">ADVENTURE</h2>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="z-10 glass-panel p-8 rounded-3xl max-w-2xl mb-12 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
      >
        <h3 className="text-2xl font-bold text-white mb-6 text-center">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-200">
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">👆</div>
            <p>Click, tap, and drag to interact with machines.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50">🤖</div>
            <p>Listen to Volt the Robot for helpful clues.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">⚡</div>
            <p>Learn how electricity reaches your home!</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/50">⭐</div>
            <p>Collect stars and points along the way.</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLevel(1)}
        className="z-10 px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-display font-bold text-3xl rounded-full glow-yellow flex items-center gap-4 hover:shadow-[0_0_40px_rgba(255,204,0,0.8)] transition-all"
      >
        <Play className="w-10 h-10 fill-slate-900" />
        START ADVENTURE
      </motion.button>
    </div>
  );
};
