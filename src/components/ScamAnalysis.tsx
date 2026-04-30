import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Search, Loader2, Info } from 'lucide-react';
import { analyzeScam, ScamAnalysisResult } from '../services/geminiService';

export default function ScamAnalysis() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeScam(inputText);
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'text-emerald-400';
      case 'Suspicious': return 'text-amber-400';
      case 'Scam': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Safe': return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case 'Suspicious': return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      case 'Scam': return <ShieldAlert className="w-8 h-8 text-rose-500" />;
      default: return <Shield className="w-8 h-8 text-slate-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Safe': return 'bg-emerald-400/10 border-emerald-400/20';
      case 'Suspicious': return 'bg-amber-400/10 border-amber-400/20';
      case 'Scam': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-slate-800/50 border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6"
        >
          <Shield className="w-12 h-12 text-indigo-400" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Scam Shield AI</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Our advanced AI analyzes messages for suspicious patterns using institutional-grade scoring.
        </p>
      </header>

      <main className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative bg-[#151619] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <textarea
              id="scam-text-input"
              className="w-full h-48 bg-transparent border-0 focus:ring-0 text-slate-200 p-6 resize-none font-sans leading-relaxed placeholder:text-slate-600"
              placeholder="Paste the message, email snippet, or transcription here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="border-t border-slate-800/50 p-4 flex items-center justify-between bg-slate-900/30">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 px-2 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse"></div>
                System Active
              </div>
              <button
                id="analyze-button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-medium transition-all duration-200 text-white shadow-lg shadow-indigo-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Run Diagnosis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Urgency', points: '+2', color: 'text-indigo-400' },
            { label: 'Money', points: '+3', color: 'text-emerald-400' },
            { label: 'Job Scam', points: '+4', color: 'text-purple-400' },
            { label: 'Emotional', points: '+3', color: 'text-rose-400' }
          ].map((item) => (
            <div key={item.label} className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{item.label}</div>
              <div className={`font-mono text-sm font-bold ${item.color}`}>{item.points} PTS</div>
            </div>
          ))}
        </section>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result-display"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`p-6 rounded-2xl border ${getStatusBg(result.status)} shadow-lg`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${getStatusColor(result.status)}`}>
                      {result.status} Result
                    </h2>
                    <p className="text-slate-400 text-sm">Threat Level Identified</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-white leading-none">{result.score}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Total Score</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                  <Info className="w-3 h-3" />
                  Reasoning Report
                </div>
                {result.reasons.map((reason, idx) => (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed"
                  >
                    <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0"></div>
                    <p>{reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-16 pt-8 border-t border-slate-800/50 text-center">
        <p className="text-slate-500 text-xs font-mono tracking-widest uppercase mb-4">Educational Tool Only</p>
        <p className="text-slate-600 text-[10px] leading-relaxed max-w-sm mx-auto">
          Scam Shield AI is designed to identify common predatory patterns. 
          Never share personal information or financial data with unverified sources.
        </p>
      </footer>
    </div>
  );
}
