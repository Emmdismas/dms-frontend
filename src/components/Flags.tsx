import React from 'react';

export const BritishFlag: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg 
    className={`${className} rounded-[2px] shrink-0 shadow-xs border border-white/20 overflow-hidden`} 
    viewBox="0 0 60 30" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <clipPath id="uk-flag-clip">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <clipPath id="uk-flag-diag">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <g clipPath="url(#uk-flag-clip)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-diag)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export const TanzaniaFlag: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg 
    className={`${className} rounded-[2px] shrink-0 shadow-xs border border-white/20 overflow-hidden`} 
    viewBox="0 0 60 40" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Green upper triangle */}
    <polygon fill="#1eb53a" points="0,0 60,0 0,40" />
    {/* Blue lower triangle */}
    <polygon fill="#00a3dd" points="0,40 60,0 60,40" />
    {/* Yellow diagonal borders */}
    <polygon fill="#fcd116" points="0,40 0,27 60,0 60,13" />
    {/* Black central diagonal stripe */}
    <polygon fill="#000000" points="0,40 0,31 60,0 60,9" />
  </svg>
);
