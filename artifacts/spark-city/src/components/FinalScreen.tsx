import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { RotateCcw, Star, Award } from 'lucide-react';

export const FinalScreen = () => {
  const { score, stars, resetGame } = useGameStore();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <img 
        src={`${import.meta.env.BASE_URL}images/spark-bg.png`} 
        alt="Spark City Bright Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
      />
      
      <div className="absolute inset-0 bg-[#050b14]/70 z-0" />

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="z-10 text-center mb-8"
      >
        <Award className="w-32 h-32 mx-auto text-yellow-400 fill-yellow-400 glow-yellow mb-6" />
        <h1 className="text-6xl md:text-7xl font-display text-white drop-shadow-lg mb-4">
          CITY POWERED!
        </h1>
        <p className="text-2xl text-cyan-300 font-sans max-w-2xl mx-auto leading-relaxed">
          Congratulations! You successfully guided electricity from the dam all the way to the appliances in Spark City.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-10 glass-panel p-8 rounded-3xl mb-12 flex flex-col items-center gap-6"
      >
        <h3 className="text-3xl font-display text-white">Final Score</h3>
        <div className="text-6xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,204,0,0.8)]">
          {score}
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((starIndex) => (
            <Star 
              key={starIndex} 
              className={`w-16 h-16 ${
                stars >= starIndex 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,204,0,1)]' 
                  : 'text-slate-700'
              }`} 
            />
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetGame}
        className="z-10 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-display font-bold text-xl rounded-full flex items-center gap-3 transition-all"
      >
        <RotateCcw className="w-6 h-6" />
        PLAY AGAIN
      </motion.button>
    </div>
  );
};
