'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_LINES = [
  "Initializing NIMDA Protocol v2.0...",
  "Loading Security Modules... [OK]",
  "Establishing Secure Connection... [OK]",
  "Access Granted.",
  "Welcome, User.",
];

export default function TerminalHero() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isIntroDone, setIsIntroDone] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Intro Animation
  useEffect(() => {
    let delay = 0;
    INTRO_LINES.forEach((line, index) => {
      setTimeout(() => {
        setHistory(prev => [...prev, { type: 'system', content: line }]);
        if (index === INTRO_LINES.length - 1) {
          setTimeout(() => setIsIntroDone(true), 500);
        }
      }, delay);
      delay += 800; // Delay between lines
    });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on click
  useEffect(() => {
    if (isIntroDone && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isIntroDone]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      const newHistory = [...history, { type: 'user', content: input }];
      
      let response = "";
      switch (cmd) {
        case 'help':
          response = "Available commands: help, about, tracks, contact, clear";
          break;
        case 'about':
          response = "NIMDA is a Security Club focused on Web Hacking, System Security, and CTF.";
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'tracks':
          response = "We study: Web Hacking, System Hacking, Network Security, Reversing.";
          document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'contact':
          response = "Contact us at: amazingnimda@gmail.com";
          document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'clear':
          setHistory([]);
          setInput("");
          return;
        default:
          response = cmd ? `Command not found: ${cmd}. Type 'help' for options.` : "";
      }
      
      if (response) {
        newHistory.push({ type: 'system', content: response });
      }
      
      setHistory(newHistory);
      setInput("");
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Terminal Header */}
          <div className="flex items-center px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center text-xs font-mono text-white/50">guest@nimda:~</div>
          </div>

          {/* Terminal Body */}
          <div 
            ref={scrollRef}
            className="h-[400px] overflow-y-auto p-6 font-mono text-sm md:text-base text-gray-300 space-y-2 bg-[#0a0a0a]/90"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((line, i) => (
              <div key={i} className={`${line.type === 'user' ? 'text-white' : 'text-green-400'}`}>
                {line.type === 'user' && <span className="text-blue-400 mr-2">$</span>}
                {line.content}
              </div>
            ))}
            
            {isIntroDone && (
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  className="bg-transparent border-none outline-none text-white flex-1"
                  autoFocus
                />
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </motion.div>

        {/* Hero Slogan (Reveals after Intro) */}
        <AnimatePresence>
          {isIntroDone && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12 text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4 font-mono text-white glitch" data-text="NIMDA SECURITY">
                NIMDA SECURITY
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Programming • Security • Web • Algorithm
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
