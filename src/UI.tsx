"use client";

import React, { useState, useRef, useEffect } from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  customColor,
  customBg,
  customBorder,
  customRadius,
  customSize,
  style,
  ...props 
}: any) => {
  const base = "font-medium transition-all duration-300 relative overflow-hidden group active:scale-95 flex items-center justify-center";
  const sizeClass = customSize === 'sm' ? 'px-4 py-2 text-sm' : customSize === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3';
  
  const customStyles = {
    ...(customColor && { color: customColor }),
    ...(customBg && { backgroundColor: customBg }),
    ...(customBorder && { border: customBorder }),
    ...(customRadius && { borderRadius: customRadius }),
    ...style
  };

  if (variant === 'mecha') {
    return (
      <button 
        className={`${sizeClass} font-mono font-bold tracking-[0.2em] uppercase text-xs transition-all relative overflow-hidden group active:scale-95 flex items-center justify-center bg-zinc-900 border-l-4 border-l-yellow-500 border-y border-y-zinc-800 border-r border-r-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-l-yellow-400 ${className}`}
        style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)", ...customStyles }}
        {...props}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] pointer-events-none" />
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-yellow-500/50 group-hover:bg-yellow-400" />
      </button>
    );
  }

  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 hover:shadow-lg rounded-lg",
    glow: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:bg-indigo-500/50 rounded-lg",
    ghost: "bg-transparent text-zinc-300 hover:bg-white/10 active:bg-white/20 rounded-lg",
    outline: "bg-transparent border border-white/20 text-white hover:border-white/60 hover:bg-white/5 active:bg-white/10 rounded-lg",
    danger: "bg-rose-500/10 border border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] active:bg-rose-500/30 rounded-lg"
  };
  
  return (
    <button 
      className={`${base} ${sizeClass} ${(variants as any)[variant] || variants.primary} ${className}`} 
      style={customStyles}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const TextBox = ({ 
  variant = 'default', 
  className = '', 
  customColor,
  customBg,
  customBorder,
  customRadius,
  style,
  ...props 
}: any) => {
  const base = "w-full focus:outline-none transition-all";
  
  const customStyles = {
    ...(customColor && { color: customColor }),
    ...(customBg && { backgroundColor: customBg }),
    ...(customBorder && { border: customBorder }),
    ...(customRadius && { borderRadius: customRadius }),
    ...style
  };

  const variants = {
    default: "bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
    underline: "bg-transparent border-b-2 border-white/10 px-0 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 rounded-none",
    glow: "bg-indigo-500/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-indigo-100 placeholder:text-indigo-500/50 focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    mecha: "bg-black border border-zinc-800 focus:border-yellow-500 text-yellow-50 font-mono text-sm px-4 py-3 rounded-none placeholder:text-zinc-700 relative z-10 w-full"
  };

  if (variant === 'mecha') {
    return (
      <div className={`relative ${className}`} style={{ ...(customRadius && { borderRadius: customRadius }) }}>
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        <input 
          className={variants.mecha}
          style={customStyles}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-yellow-500/30 pointer-events-none">[INPUT]</div>
      </div>
    );
  }

  return (
    <input 
      className={`${base} ${(variants as any)[variant] || variants.default} ${className}`}
      style={customStyles}
      {...props}
    />
  );
};

export const Dropdown = ({ options = [], variant = 'default', placeholder = "Select...", className = '' }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const base = "w-full transition-all cursor-pointer flex justify-between items-center";
  const variants = {
    default: "bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500",
    ghost: "bg-white/5 border border-transparent rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 focus:bg-[#0a0a0f] focus:border-indigo-500",
    mecha: "bg-black border border-zinc-800 rounded-none px-4 py-3 text-yellow-50 font-mono text-sm hover:border-yellow-500/50 focus:border-yellow-500 relative"
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {variant === 'mecha' && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500/50 z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500/50 z-10 pointer-events-none" />
        </>
      )}
      <div 
        className={`${base} ${(variants as any)[variant] || variants.default}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-white' : 'text-zinc-500'}>
          {selected || placeholder}
        </span>
        <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${variant === 'mecha' ? 'bg-black border border-yellow-500/50 rounded-none shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-[#0a0a0f] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'}`}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt: string, i: number) => (
              <div 
                key={i} 
                className={variant === 'mecha' 
                  ? `px-4 py-3 text-sm cursor-pointer transition-colors font-mono ${selected === opt ? 'bg-yellow-500/20 text-yellow-300 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-900 border-l-2 border-transparent hover:text-white'}`
                  : `px-4 py-3 text-sm cursor-pointer transition-colors ${selected === opt ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-300 hover:bg-white/10 hover:text-white'}`
                }
                onClick={() => {
                  setSelected(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  customColor,
  customBg,
  customBorder,
  customRadius,
  style,
  ...props 
}: any) => {
  const base = "transition-all duration-300 relative overflow-hidden";
  
  const customStyles = {
    ...(customColor && { color: customColor }),
    ...(customBg && { backgroundColor: customBg }),
    ...(customBorder && { border: customBorder }),
    ...(customRadius && { borderRadius: customRadius }),
    ...style
  };

  const variants = {
    default: "p-6 rounded-2xl bg-[#050508] border border-white/10",
    glow: "p-6 rounded-2xl bg-indigo-900/10 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
    glass: "p-6 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]",
    mecha: "p-8 rounded-none bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm"
  };

  if (variant === 'mecha') {
    return (
      <div className={`${base} ${variants.mecha} ${className}`} style={customStyles} {...props}>
        {/* Mecha Card Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500/50 pointer-events-none" style={{ borderColor: customBorder ? customBorder.split(' ')[2] || customBorder : undefined }} />
        
        {/* Warning track background */}
        <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(234,179,8,0.5)_4px,rgba(234,179,8,0.5)_8px)] pointer-events-none" />
        
        {children}
      </div>
    );
  }

  return (
    <div className={`${base} ${(variants as any)[variant] || variants.default} ${className}`} style={customStyles} {...props}>
      {children}
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  customColor,
  customBg,
  customBorder,
  customRadius,
  style,
  ...props 
}: any) => {
  const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all";
  
  const customStyles = {
    ...(customColor && { color: customColor }),
    ...(customBg && { backgroundColor: customBg }),
    ...(customBorder && { border: customBorder }),
    ...(customRadius && { borderRadius: customRadius }),
    ...style
  };

  if (variant === 'mecha') {
    return (
      <span className={`px-2 py-1 bg-yellow-500/10 border border-yellow-500/50 text-[#eab308] text-[9px] font-mono font-bold tracking-[0.2em] relative uppercase ${className}`} style={customStyles} {...props}>
        <span className="absolute -left-1 flex items-center justify-center top-1/2 -translate-y-1/2 h-full gap-[1px] bg-[#020205] px-[2px]">
          <span className="w-[1px] h-2 bg-yellow-500" style={{ backgroundColor: customColor || undefined }} />
          <span className="w-[1px] h-2 bg-yellow-500" style={{ backgroundColor: customColor || undefined }} />
        </span>
        <span className="pl-1">{children}</span>
      </span>
    );
  }

  const variants = {
    primary: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50",
    danger: "bg-rose-500/20 text-rose-300 border border-rose-500/50",
    outline: "bg-transparent text-zinc-400 border border-zinc-700"
  };

  return (
    <span className={`${base} ${(variants as any)[variant] || variants.primary} ${className}`} style={customStyles} {...props}>
      {children}
    </span>
  );
};

export const Switch = ({ 
  checked, 
  onChange, 
  variant = 'default', 
  className = '',
  customColor,
  customBg,
  customBorder,
  customRadius,
  style,
  ...props 
}: any) => {
  const customStyles = {
    ...(customBg && { backgroundColor: customBg }),
    ...(customBorder && { border: customBorder }),
    ...(customRadius && { borderRadius: customRadius }),
    ...style
  };

  if (variant === 'mecha') {
    return (
      <div 
        className={`w-14 h-6 border-2 border-zinc-700 bg-zinc-900 relative cursor-pointer flex items-center p-0.5 transition-colors ${checked ? 'border-yellow-500/50' : ''} ${className}`} 
        onClick={onChange}
        style={customStyles}
        {...props}
      >
        {/* Warning track background */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.02)_4px,rgba(255,255,255,0.02)_8px)] pointer-events-none" />
        <div 
          className={`w-5 h-4 bg-zinc-400 absolute transition-all duration-300 ease-out flex items-center justify-center ${checked ? 'left-[30px] bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'left-0.5'}`} 
          style={{ backgroundColor: checked && customColor ? customColor : undefined, boxShadow: checked && customColor ? `0 0 10px ${customColor}` : undefined }}
        >
           <div className={`w-[2px] h-2 ${checked ? 'bg-black/50' : 'bg-black/20'}`} />
        </div>
      </div>
    );
  }

  const base = "w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300";
  const variants = {
    default: checked ? "bg-white" : "bg-zinc-800",
    glow: checked ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-zinc-800"
  };
  const thumbBase = "w-4 h-4 rounded-full absolute top-1 transition-all duration-300";
  const thumbVariants = {
    default: checked ? "left-6 bg-black" : "left-1 bg-zinc-400",
    glow: checked ? "left-6 bg-white" : "left-1 bg-zinc-500"
  };

  return (
    <div className={`${base} ${(variants as any)[variant] || variants.default} ${className}`} style={customStyles} onClick={onChange} {...props}>
      <div className={`${thumbBase} ${(thumbVariants as any)[variant] || thumbVariants.default}`} style={{ backgroundColor: checked && customColor ? customColor : undefined }} />
    </div>
  );
};
