import React, { useState, useEffect } from 'react';
import { X, BookOpen, Volume2, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoData } from '../types';

interface InfoModalProps {
  info: InfoData | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ info, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when modal closes or info changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [info, onClose]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (info) {
      const utterance = new SpeechSynthesisUtterance(`${info.title}. ${info.description}`);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Match Priority Logic from App.tsx
      const preferred = voices.find(v => v.name.includes("Rishi") || v.name.includes("Sangeeta") || v.name.includes("Veena") || v.name.includes("Prabhat"));
      const anyHindi = voices.find(v => v.lang.includes("hi-IN") || v.name.includes("Hindi"));
      const anyIndianEnglish = voices.find(v => v.lang === "en-IN");
      
      const indianVoice = preferred || anyHindi || anyIndianEnglish;

      if (indianVoice) {
          utterance.voice = indianVoice;
          utterance.rate = 0.9;
      }
      
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <AnimatePresence>
      {info && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative bg-[#0a0a0a]/90 border border-white/10 p-0 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Top Gloss Effect */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500/20 to-transparent pointer-events-none" />
            
            {/* Content Container */}
            <div className="relative z-10 p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <BookOpen size={28} className="text-green-400" />
                        {info.title}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="group p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/20"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
                
                <div className="prose prose-invert">
                    <p className="text-slate-300 leading-relaxed text-lg font-light tracking-wide">
                        {info.description}
                    </p>
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
                    <button
                        onClick={toggleSpeech}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                            ${isSpeaking 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {isSpeaking ? (
                            <>
                                <StopCircle size={18} className="animate-pulse" /> Stop Audio
                            </>
                        ) : (
                            <>
                                <Volume2 size={18} /> Listen
                            </>
                        )}
                    </button>

                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white text-black hover:bg-green-400 rounded-full font-bold transition-colors shadow-lg shadow-green-900/20"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};