"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install spatial-ui-universe three @react-three/fiber framer-motion");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#050508] border border-white/10 shadow-2xl p-8"
          >
            {/* Background Glow */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-fuchsia-500/20 blur-[80px] rounded-full" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                  Quick Install
                </h2>
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">Run this in your terminal</label>
                  <div className="flex bg-[#0a0a0f] border border-white/10 rounded-xl p-2 items-center">
                    <div className="flex-1 px-3 py-2 font-mono text-sm text-zinc-300 overflow-x-auto whitespace-nowrap">
                      <span className="text-indigo-400 mr-3">~</span>
                      npm install spatial-ui-universe three @react-three/fiber
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="ml-2 px-4 py-2 bg-white/10 hover:bg-white/20 flex-shrink-0 rounded-lg text-white text-xs font-bold transition-all w-24 flex justify-center items-center"
                    >
                      {copied ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                </div>
                
                <Link 
                  href="/docs"
                  onClick={onClose}
                  className="flex items-center justify-center w-full py-4 mt-6 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-transform hover:scale-[1.02]"
                >
                  Read the Documentation
                </Link>
                
                <div className="text-center mt-4">
                  <p className="text-xs text-zinc-500">Require Node.js, React 18+, and Tailwind CSS.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}