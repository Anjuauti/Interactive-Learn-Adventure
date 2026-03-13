import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Play, Zap } from 'lucide-react';

export const StartScreen = () => {
  const { setLevel } = useGameStore();

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #e0f2fe 0%, #f8fafc 60%)' }}
    >
      {/* Background Image Texture */}
      <img 
        src={`${import.meta.env.BASE_URL}images/spark-bg.png`} 
        alt="Spark City Background"
        className="absolute inset-0 w-full h-full object-cover opacity-10 z-0 mix-blend-multiply"
      />
      
      {/* Particle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
              opacity: 0
            }}
            animate={{
              y: -10,
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-6 h-full" style={{gap: '3vh'}}>
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center shrink-0"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-float" />
            <h1 className="text-5xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-cyan-500 drop-shadow-md leading-none">
              SPARK CITY
            </h1>
            <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-float" />
          </div>
          <h2 className="text-2xl md:text-4xl font-display text-orange-500">ADVENTURE</h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold mt-2 tracking-widest uppercase">From Generation to Home Electricity</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-3xl shrink-0">
          {[
            { gradient: "from-cyan-400 to-blue-600", icon: "👆", label: "Click & Drag Machines", delay: 0.2 },
            { gradient: "from-yellow-400 to-orange-500", icon: "🤖", label: "Listen to Volt's Clues", delay: 0.3 },
            { gradient: "from-green-400 to-teal-600", icon: "⚡", label: "Learn Electricity Flow", delay: 0.4 },
            { gradient: "from-purple-500 to-pink-500", icon: "⭐", label: "Collect Stars & Points", delay: 0.5 },
          ].map((card) => (
            <motion.div
              key={card.label}
              whileHover={{ scale: 1.04 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: card.delay }}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl py-3 px-4 shadow-md flex items-center gap-3 border-2 border-white/40`}
            >
              <div className="text-3xl drop-shadow-lg shrink-0">{card.icon}</div>
              <p className="text-white font-bold text-sm md:text-base leading-tight">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setLevel(1)}
          className="shrink-0 px-10 py-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-display font-bold text-xl md:text-2xl rounded-full shadow-lg flex items-center gap-3 transition-all border-4 border-yellow-100"
        >
          <Play className="w-7 h-7 fill-white" />
          START ADVENTURE
        </motion.button>
      </div>

      <motion.img 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        src={`${import.meta.env.BASE_URL}images/volt-robot.png`} 
        alt="Volt Waving"
        className="absolute bottom-4 right-4 w-36 h-auto animate-float drop-shadow-xl z-20 pointer-events-none"
      />
    </div>
  );
};