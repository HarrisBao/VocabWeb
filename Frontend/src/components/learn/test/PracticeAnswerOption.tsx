import React from 'react';
import { Check, X } from 'lucide-react';

export type PastelVariant = 'BLUE' | 'PURPLE' | 'YELLOW' | 'PINK' | 'CYAN' | 'ORANGE';

export type OptionState = 'DEFAULT' | 'SELECTED' | 'CORRECT' | 'INCORRECT' | 'MUTED' | 'DISABLED';

interface PracticeAnswerOptionProps {
  text: string;
  variant: PastelVariant;
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
}

const variantStyles: Record<PastelVariant, string> = {
  BLUE: 'bg-[#EFF6FF] border-[#DBEAFE] hover:bg-[#DBEAFE] hover:border-blue-200',
  PURPLE: 'bg-[#F5F3FF] border-[#EDE9FE] hover:bg-[#EDE9FE] hover:border-purple-200',
  YELLOW: 'bg-[#FFFBEB] border-[#FEF3C7] hover:bg-[#FEF3C7] hover:border-amber-200',
  PINK: 'bg-[#FDF2F8] border-[#FCE7F3] hover:bg-[#FCE7F3] hover:border-pink-200',
  CYAN: 'bg-[#ECFEFF] border-[#CFFAFE] hover:bg-[#CFFAFE] hover:border-cyan-200',
  ORANGE: 'bg-[#FFF7ED] border-[#FFEDD5] hover:bg-[#FFEDD5] hover:border-orange-200',
};

export const PracticeAnswerOption: React.FC<PracticeAnswerOptionProps> = ({
  text,
  variant,
  state,
  onClick,
  disabled
}) => {
  let containerStyle = '';
  let textStyle = 'text-gray-800';
  let icon = null;

  switch (state) {
    case 'CORRECT':
      containerStyle = 'bg-[#DCFCE7] border-[#16A34A] shadow-sm z-10';
      textStyle = 'text-[#15803D] font-bold';
      icon = <Check className="text-[#15803D] shrink-0" size={24} />;
      break;
    case 'INCORRECT':
      containerStyle = 'bg-[#FEE2E2] border-[#DC2626] shadow-sm z-10';
      textStyle = 'text-[#DC2626] font-bold';
      icon = <X className="text-[#DC2626] shrink-0" size={24} />;
      break;
    case 'MUTED':
      containerStyle = 'bg-gray-50 border-gray-100 opacity-50';
      textStyle = 'text-gray-400';
      break;
    case 'SELECTED':
      // Test mode selected
      containerStyle = 'bg-green-50 border-green-500 shadow-sm z-10';
      textStyle = 'text-green-900 font-bold';
      break;
    case 'DISABLED':
      containerStyle = 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed';
      textStyle = 'text-gray-500';
      break;
    case 'DEFAULT':
    default:
      containerStyle = `${variantStyles[variant]} cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-sm`;
      break;
  }

  const isLocked = state !== 'DEFAULT' && state !== 'SELECTED';
  const ariaLabel = state === 'CORRECT' ? `${text}, đáp án đúng` : state === 'INCORRECT' ? `${text}, câu trả lời đã chọn, không đúng` : text;

  return (
    <button
      onClick={() => {
        if (!isLocked && !disabled) onClick();
      }}
      disabled={isLocked || disabled}
      className={`w-full p-6 rounded-xl border-2 text-lg transition-all flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${containerStyle}`}
      aria-label={ariaLabel}
      aria-disabled={isLocked || disabled}
    >
      <span className={textStyle}>{text}</span>
      {icon}
    </button>
  );
};

export const getPastelVariant = (index: number, questionIndex: number): PastelVariant => {
  const variants: PastelVariant[] = ['BLUE', 'PURPLE', 'YELLOW', 'PINK', 'CYAN', 'ORANGE'];
  // Rotate based on question index to avoid visual repetition
  const startIndex = questionIndex % variants.length;
  return variants[(startIndex + index) % variants.length];
};
