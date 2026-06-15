import React from 'react';

const ALPS_LOGO_URL = 'https://media.base44.com/images/public/69e44004c1822ff0840cc105/f714d80a7_11_20260421_122607_0000.png';

/**
 * "From [Alps Prime logo] Alps Prime" — exibido logo abaixo da logo da plataforma
 * (estilo Facebook "From Meta").
 */
export default function PoweredByAlps({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <span className="text-[10px] text-foreground/60 tracking-wide font-semibold">From</span>
      <img
        src={ALPS_LOGO_URL}
        alt="Alps Prime"
        className="w-3.5 h-3.5 object-contain"
        style={{ filter: 'brightness(0) saturate(100%)' }}
      />
      <span className="text-[11px] font-extrabold text-foreground">Alps Prime</span>
    </div>
  );
}