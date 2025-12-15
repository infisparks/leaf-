import React from 'react';
import { SceneType, SimulationState, SCENE_SCRIPTS } from '../types';
import { ChevronRight, ChevronLeft, Info, Sun, Zap, Droplets, RotateCw, BookOpen, Microscope, Play, Square } from 'lucide-react';
import { Scene5Summary } from './scenes/Scene5Summary'; 
import { Scene6Practice } from './scenes/Scene6Practice'; 

interface UIOverlayProps {
  appState: SimulationState;
  setAppState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onNext: () => void;
  onPrev: () => void;
  onJump: (scene: SceneType) => void;
  onStartExecution: () => void;
  onStopExecution: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ appState, setAppState, onNext, onPrev, onJump, onStartExecution, onStopExecution }) => {
  
  const getTitle = () => {
    switch(appState.currentScene) {
      case SceneType.LEAF_OVERVIEW: return "The Plant Leaf";
      case SceneType.CHLOROPLAST_ZOOM: return "Inside the Chloroplast";
      case SceneType.LIGHT_REACTION: return "Light Reaction";
      case SceneType.CALVIN_CYCLE: return "Calvin Cycle";
      case SceneType.SUMMARY: return "Process Summary";
      case SceneType.PRACTICE: return "Knowledge Check";
      default: return "";
    }
  };

  const currentScript = SCENE_SCRIPTS[appState.currentScene];
  const currentScriptText = appState.executionActive && currentScript && currentScript[appState.executionStep] 
    ? currentScript[appState.executionStep].text 
    : "";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 font-sans text-white select-none">
      
      {/* Top Bar: Title & Global Settings */}
      <div className="pointer-events-auto flex justify-between items-start w-full">
        {/* Title Card */}
        <div className="bg-[#0f172a]/70 backdrop-blur-xl pl-6 pr-10 py-5 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-1 transition-all hover:border-white/10">
          <div className="flex items-center gap-3">
             <div className="text-green-400/80">
               {appState.currentScene === SceneType.LEAF_OVERVIEW && <Sun size={18} />}
               {appState.currentScene === SceneType.CHLOROPLAST_ZOOM && <Microscope size={18} />}
               {appState.currentScene === SceneType.LIGHT_REACTION && <Zap size={18} />}
               {appState.currentScene === SceneType.CALVIN_CYCLE && <RotateCw size={18} />}
               {appState.currentScene >= SceneType.SUMMARY && <BookOpen size={18} />}
             </div>
             <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Module {appState.currentScene + 1}</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            {getTitle()}
          </h1>
        </div>

        {/* Global Controls */}
        <div className="flex gap-3">
            {currentScript && currentScript.length > 0 && (
                <button 
                    onClick={appState.executionActive ? onStopExecution : onStartExecution}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 backdrop-blur-md border shadow-lg
                        ${appState.executionActive 
                            ? 'bg-red-500/20 border-red-500/50 text-red-100 hover:bg-red-500/30' 
                            : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-blue-900/40'}
                    `}
                >
                    {appState.executionActive ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    <span>{appState.executionActive ? 'Stop Simulation' : 'Execute Simulation'}</span>
                </button>
            )}

            <button 
                onClick={() => setAppState(prev => ({...prev, showLabels: !prev.showLabels}))}
                className={`
                    flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md border shadow-lg
                    ${appState.showLabels 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}
                `}
            >
                <Info size={16} />
                <span className="hidden md:inline">Annotations {appState.showLabels ? 'On' : 'Off'}</span>
            </button>
        </div>
      </div>

      {/* Center Viewport Content (Summary/Quiz) */}
      <div className="flex-1 flex flex-col items-center justify-center pointer-events-none relative">
        {appState.currentScene === SceneType.SUMMARY && (
          <div className="pointer-events-auto w-full max-w-5xl scale-90 md:scale-100 transition-transform">
             <Scene5Summary />
          </div>
        )}
        {appState.currentScene === SceneType.PRACTICE && (
          <div className="pointer-events-auto w-full max-w-3xl">
             <Scene6Practice />
          </div>
        )}
      </div>
      
      {/* Absolute Bottom Subtitle Overlay */}
      {appState.executionActive && currentScriptText && (
         <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-20">
             <div className="pointer-events-auto max-w-3xl text-center mx-4">
                 <div className="bg-black/70 backdrop-blur-xl px-8 py-4 rounded-2xl border-l-4 border-green-500 shadow-2xl transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <p className="text-xl text-white font-medium leading-relaxed tracking-wide drop-shadow-md">
                        {currentScriptText}
                     </p>
                 </div>
             </div>
         </div>
      )}

      {/* Bottom Bar: Interactive Controls & Nav */}
      <div className="pointer-events-auto flex flex-col gap-6 w-full items-center md:items-stretch">
        
        {/* Contextual HUD Controls (Hide during execution for cleaner view) */}
        {!appState.executionActive && appState.currentScene === SceneType.LIGHT_REACTION && (
          <div className="bg-[#0f172a]/80 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/5 shadow-2xl self-center flex items-center gap-8">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sun size={10}/> Intensity
                </label>
                <div className="flex items-center gap-3">
                    <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={appState.lightIntensity}
                        onChange={(e) => setAppState(prev => ({...prev, lightIntensity: parseFloat(e.target.value)}))}
                        className="w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                </div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <button 
                onClick={() => setAppState(prev => ({...prev, photolysisEnabled: !prev.photolysisEnabled}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                ${appState.photolysisEnabled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-slate-500 border border-transparent hover:text-white'}`}
            >
                <Droplets size={14} className={appState.photolysisEnabled ? 'animate-pulse' : ''} />
                Photolysis {appState.photolysisEnabled ? 'Active' : 'Off'}
            </button>
          </div>
        )}

        {!appState.executionActive && appState.currentScene === SceneType.CALVIN_CYCLE && (
          <div className="bg-[#0f172a]/80 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/5 shadow-2xl self-center flex gap-4 text-xs font-mono text-slate-400">
             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> ATP Input</span>
             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-100"></span> NADPH Input</span>
             <span className="text-green-400 font-bold">→ Glucose Generated</span>
          </div>
        )}

        {/* Navigation Dock */}
        <div className="w-full flex justify-between items-center mt-2">
            {/* Back Button */}
            <button 
                onClick={onPrev}
                disabled={appState.currentScene === SceneType.LEAF_OVERVIEW || appState.executionActive}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed border border-white/5 transition-all hover:scale-105"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Pagination Dots */}
            <div className="flex gap-2">
                {Array.from({length: 6}).map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => onJump(idx)}
                        disabled={appState.executionActive}
                        className={`h-1.5 rounded-full transition-all duration-500 ${appState.currentScene === idx ? 'w-8 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'} disabled:opacity-50`}
                    />
                ))}
            </div>

            {/* Next Button */}
            <button 
                onClick={onNext}
                disabled={appState.currentScene === SceneType.PRACTICE || appState.executionActive}
                className="group flex items-center gap-3 px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-green-400 disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]"
            >
                {appState.currentScene === SceneType.SUMMARY ? 'Start Quiz' : 'Next'} 
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};