import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { ChevronRight } from 'lucide-react';

const LEVEL_ICONS = [
  { icon: '💧', label: 'Dam' },
  { icon: '⚙️', label: 'Generator' },
  { icon: '⚡', label: 'Transmission' },
  { icon: '🏠', label: 'Home' },
  { icon: '💡', label: 'Appliances' },
];

const INSTRUCTIONS = [
  {
    icon: '👆',
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    text: 'Tap and interact with 3D machines',
    active: true,
  },
  {
    icon: '🎚️',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    text: 'Adjust controls to maintain correct settings',
    active: false,
  },
  {
    icon: '🔧',
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    text: 'Drag components to install them',
    active: false,
  },
  {
    icon: '🔌',
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
    text: 'Connect wires to build circuits',
    active: false,
  },
  {
    icon: '🔁',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    text: 'Switch appliances ON to power the city',
    active: false,
  },
];

export const StartScreen = () => {
  const { setLevel } = useGameStore();
  const [showInstructions, setShowInstructions] = useState(false);
  const [instrStep, setInstrStep] = useState(0);

  const handleStart = () => {
    setShowInstructions(true);
    setInstrStep(0);
  };

  const handleNext = () => {
    if (instrStep < INSTRUCTIONS.length - 1) {
      setInstrStep(s => s + 1);
    } else {
      setLevel(1);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg, #dbeafe 0%, #f8fafc 45%, #fef9c3 100%)',
      }}
    >
      {/* Main Landing */}
      <AnimatePresence>
        {!showInstructions && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center w-full h-full px-8 gap-5"
          >
            {/* Level Step Icons */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3"
            >
              {LEVEL_ICONS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, type: 'spring' }}
                  className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-sm"
                  title={item.label}
                >
                  {item.icon}
                </motion.div>
              ))}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h1 className="font-display font-bold text-slate-800 leading-tight" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                <span className="text-yellow-400 mr-2">⚡</span>
                Spark City<br />Adventure
              </h1>
              <p className="text-blue-500 font-bold mt-2" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
                From Generation to Home Electricity
              </p>
              <p className="text-slate-400 mt-1 font-medium" style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)' }}>
                Restore electricity to Spark City through 7 interactive missions!
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', bounce: 0.4 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
              className="px-10 py-3 rounded-full font-display font-bold text-slate-900 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                boxShadow: '0 4px 20px rgba(251,191,36,0.45)',
              }}
            >
              Start Adventure!
            </motion.button>

            {/* Volt link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 text-slate-400 font-medium"
              style={{ fontSize: '0.8rem' }}
            >
              <span>🤖</span>
              <span>Meet Volt — Your AI Robot Guide</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(241,245,249,0.6)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ width: 'min(480px, 90vw)', maxHeight: '90%' }}
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-4">
                <h2 className="font-display font-bold text-slate-800 text-2xl">Welcome to Spark City!</h2>
                <p className="text-slate-400 text-sm mt-1">Learn how electricity travels from power plant to your home</p>
              </div>

              {/* Steps list */}
              <div className="px-8 pb-6 flex flex-col gap-3 flex-1">
                {INSTRUCTIONS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: i <= instrStep ? 1 : 0.35 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      i === instrStep
                        ? 'border-2 border-blue-200 shadow-sm'
                        : 'border border-transparent'
                    }`}
                    style={{
                      background: i === instrStep ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: item.iconBg }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`font-medium text-sm ${i === instrStep ? 'text-slate-800' : 'text-slate-400'}`}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 pb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {INSTRUCTIONS.map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        background: i === instrStep ? '#3b82f6' : '#cbd5e1',
                        width: i === instrStep ? '1.5rem' : '0.5rem',
                      }}
                    />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-md"
                  style={{ background: '#3b82f6' }}
                >
                  {instrStep < INSTRUCTIONS.length - 1 ? (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>Play! <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
