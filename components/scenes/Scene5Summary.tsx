import React from 'react';
import { motion } from 'framer-motion';

export const Scene5Summary: React.FC = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center">
        {/* Light Reaction Card */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-gradient-to-br from-green-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-green-500/30 shadow-xl"
        >
            <h2 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black text-sm">1</span>
                Light Reaction
            </h2>
            <div className="space-y-4 text-slate-200">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Location</span>
                    <span className="font-semibold">Thylakoid Membrane</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Inputs</span>
                    <span className="font-semibold text-right">Light, Water (H₂O), NADP+, ADP</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Outputs</span>
                    <span className="font-semibold text-right">Oxygen (O₂), ATP, NADPH</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Key Event</span>
                    <span className="font-semibold">Photolysis (Water Splitting)</span>
                </div>
            </div>
        </motion.div>

        {/* Calvin Cycle Card */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 bg-gradient-to-br from-blue-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 shadow-xl"
        >
            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-black text-sm">2</span>
                Calvin Cycle
            </h2>
            <div className="space-y-4 text-slate-200">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Location</span>
                    <span className="font-semibold">Stroma (Fluid)</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Inputs</span>
                    <span className="font-semibold text-right">CO₂, ATP, NADPH</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Outputs</span>
                    <span className="font-semibold text-right">G3P (Glucose), ADP, NADP+</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Key Event</span>
                    <span className="font-semibold">Carbon Fixation</span>
                </div>
            </div>
        </motion.div>
    </div>
  );
};