import React from 'react';

interface ReadingPassagePanelProps {
  htmlContent: string;
}

export const ReadingPassagePanel: React.FC<ReadingPassagePanelProps> = ({ htmlContent }) => {
  return (
    <div className="prose prose-slate max-w-none pb-32">
      <div 
        className="reading-passage-content text-gray-800 leading-relaxed text-[1.1rem] text-justify"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
};
