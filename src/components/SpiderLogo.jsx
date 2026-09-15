import React from 'react';

/**
 * High-precision Spider-Man inspired geometric spiderweb & spider emblem
 */
export default function SpiderLogo({ size = 36, className = '', variant = 'badge', glow = true }) {
  if (variant === 'icon-only') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Radial Web Strands */}
        <line x1="32" y1="6" x2="32" y2="58" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.45" />
        <line x1="6" y1="32" x2="58" y2="32" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.45" />
        <line x1="13.6" y1="13.6" x2="50.4" y2="50.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.45" />
        <line x1="50.4" y1="13.6" x2="13.6" y2="50.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.45" />

        {/* Concentric Web Rings (Inward-curving spiderweb arcs) */}
        {/* Outer Ring */}
        <path 
          d="M32 10 Q21 14 16 21 Q12 32 16 43 Q21 50 32 54 Q43 50 48 43 Q52 32 48 21 Q43 14 32 10 Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6" 
        />
        {/* Inner Ring */}
        <path 
          d="M32 18 Q25 21 21 26 Q18 32 21 38 Q25 43 32 46 Q39 43 43 38 Q46 32 43 26 Q39 21 32 18 Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.75" 
        />

        {/* Central Geometric Spider Emblem */}
        <g fill="currentColor">
          {/* Head & Upper Thorax */}
          <polygon points="32,23 35,27 32,29 29,27" />
          {/* Abdomen */}
          <polygon points="32,29.5 35.5,35 32,43 28.5,35" />
          
          {/* 8 Aerodynamic Angular Legs */}
          {/* Top Left Leg */}
          <polyline points="30,26 23,19 25,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Top Right Leg */}
          <polyline points="34,26 41,19 39,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Upper-Mid Left Leg */}
          <polyline points="29.5,28 19,25 15,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Upper-Mid Right Leg */}
          <polyline points="34.5,28 45,25 49,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Lower-Mid Left Leg */}
          <polyline points="29.5,34 19,38 16,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Lower-Mid Right Leg */}
          <polyline points="34.5,34 45,38 48,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Bottom Left Leg */}
          <polyline points="30.5,37 24,45 26,52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Bottom Right Leg */}
          <polyline points="33.5,37 40,45 38,52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    );
  }

  // Default: App Icon Badge with Teal Serio Verify gradient & glowing spiderweb
  return (
    <div 
      style={{ width: size, height: size }}
      className={`relative rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2B7A78] via-[#205E5D] to-[#17252A] border border-[#3AAFA9]/40 shadow-md ${glow ? 'shadow-[#3AAFA9]/30 hover:shadow-lg hover:shadow-[#3AAFA9]/50' : ''} transition-all overflow-hidden shrink-0 ${className}`}
    >
      {/* Background Micro Spiderweb Mesh */}
      <svg 
        className="absolute inset-0 w-full h-full text-[#3AAFA9]/25 pointer-events-none" 
        viewBox="0 0 64 64" 
        fill="none"
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
        <line x1="32" y1="0" x2="32" y2="64" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        <line x1="0" y1="32" x2="64" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        <line x1="0" y1="0" x2="64" y2="64" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <line x1="64" y1="0" x2="0" y2="64" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Spider Emblem */}
      <svg 
        className="w-[78%] h-[78%] text-[#FEFFFF] relative z-10 drop-shadow-[0_2px_8px_rgba(58,175,169,0.5)]" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radial Web Strands */}
        <line x1="32" y1="8" x2="32" y2="56" stroke="#DEF2F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="8" y1="32" x2="56" y2="32" stroke="#DEF2F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="15" y1="15" x2="49" y2="49" stroke="#DEF2F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="49" y1="15" x2="15" y2="49" stroke="#DEF2F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Concentric Web Rings */}
        <path 
          d="M32 12 Q22 15 17 22 Q13 32 17 42 Q22 49 32 52 Q42 49 47 42 Q51 32 47 22 Q42 15 32 12 Z" 
          stroke="#3AAFA9" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.65" 
        />
        <path 
          d="M32 20 Q26 22 23 26 Q20 32 23 38 Q26 42 32 44 Q38 42 41 38 Q44 32 41 26 Q38 22 32 20 Z" 
          stroke="#DEF2F1" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.8" 
        />

        {/* Central Geometric Spider */}
        <g fill="#FEFFFF">
          {/* Head & Upper Thorax */}
          <polygon points="32,24 35,27.5 32,29.5 29,27.5" />
          {/* Abdomen */}
          <polygon points="32,30 35.5,35 32,43 28.5,35" />
          
          {/* 8 Legs */}
          {/* Top Left */}
          <polyline points="30,26 23,19 25,12" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Top Right */}
          <polyline points="34,26 41,19 39,12" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Upper-Mid Left */}
          <polyline points="29.5,28 19,25 15,20" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Upper-Mid Right */}
          <polyline points="34.5,28 45,25 49,20" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Lower-Mid Left */}
          <polyline points="29.5,34 19,38 16,45" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Lower-Mid Right */}
          <polyline points="34.5,34 45,38 48,45" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Bottom Left */}
          <polyline points="30.5,37 24,45 26,52" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Bottom Right */}
          <polyline points="33.5,37 40,45 38,52" stroke="#FEFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}
