import React from 'react';

export const BilingualText: React.FC<{
  primary: string;
  secondary: string;
  primaryClass?: string;
  secondaryClass?: string;
  containerClass?: string;
}> = ({ 
  primary, 
  secondary, 
  primaryClass = "font-bold", 
  secondaryClass = "text-sm opacity-70", 
  containerClass = "flex flex-col" 
}) => (
  <div className={containerClass}>
    <span className={primaryClass}>{primary}</span>
    <span className={secondaryClass}>{secondary}</span>
  </div>
);
