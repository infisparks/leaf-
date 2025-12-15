import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_DATA } from '../../types';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const Scene6Practice: React.FC = () => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQ = QUIZ_DATA[currentQuestionIdx];

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < QUIZ_DATA.length - 1) {
      setCurrentQuestionIdx(p => p + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setShowResults(false);
  }

  if (showResults) {
      return (
          <div className="bg-black/70 backdrop-blur-xl p-8 rounded-2xl text-center border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
              <div className="text-6xl font-black text-green-400 mb-6">
                  {Math.round((score / QUIZ_DATA.length) * 100)}%
              </div>
              <p className="text-slate-300 mb-8">
                  You got {score} out of {QUIZ_DATA.length} correct.
              </p>
              <button 
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                  <RefreshCw size={20}/> Try Again
              </button>
          </div>
      )
  }

  return (
    <div className="bg-black/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl w-full border border-white/20 shadow-2xl relative overflow-hidden">
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-300" style={{ width: `${((currentQuestionIdx + 1) / QUIZ_DATA.length) * 100}%` }}></div>
      
      <div className="mb-6 flex justify-between items-center text-slate-400 text-sm">
          <span>Question {currentQuestionIdx + 1} of {QUIZ_DATA.length}</span>
          <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={currentQuestionIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed">
                {currentQ.question}
            </h3>

            <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-xl border border-white/10 transition-all duration-200 font-medium ";
                    
                    if (isAnswered) {
                        if (idx === currentQ.correctAnswer) btnClass += "bg-green-600/20 border-green-500 text-green-300";
                        else if (idx === selectedOption) btnClass += "bg-red-600/20 border-red-500 text-red-300";
                        else btnClass += "bg-white/5 text-slate-400 opacity-50";
                    } else {
                        btnClass += "bg-white/5 hover:bg-white/10 text-slate-200 hover:border-white/30";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswered}
                            className={btnClass}
                        >
                            <div className="flex justify-between items-center">
                                <span>{opt}</span>
                                {isAnswered && idx === currentQ.correctAnswer && <CheckCircle size={20} className="text-green-500" />}
                                {isAnswered && idx === selectedOption && idx !== currentQ.correctAnswer && <XCircle size={20} className="text-red-500" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </motion.div>
      </AnimatePresence>

      {isAnswered && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-4 border-t border-white/10"
        >
            <p className="text-slate-300 text-sm mb-4">
                <span className="font-bold text-white">Explanation:</span> {currentQ.explanation}
            </p>
            <button 
                onClick={handleNext}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/30 transition-all"
            >
                {currentQuestionIdx === QUIZ_DATA.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
        </motion.div>
      )}
    </div>
  );
};