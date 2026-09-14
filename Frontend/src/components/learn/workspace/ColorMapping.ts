export const getCategoryFromType = (type: string) => {
  if (['WORD_TO_MEANING', 'MEANING_TO_WORD'].includes(type)) return 'RECOGNITION';
  if (['LISTEN_TO_WORD', 'LISTEN_TO_MEANING', 'LISTEN_TO_TYPE_WORD'].includes(type)) return 'LISTENING';
  if (['MEANING_TO_TYPE_WORD', 'WORD_TO_TYPE_MEANING', 'MISSING_LETTERS', 'UNSCRAMBLE_WORD'].includes(type)) return 'TYPING_SPELLING';
  if (['MATCH_WORD_MEANING'].includes(type)) return 'MATCHING';
  if (['PRONUNCIATION'].includes(type)) return 'SPEAKING';
  return 'DEFAULT';
};

export const getAccentColors = (category: string) => {
  switch (category) {
    case 'RECOGNITION':
      return { base: 'bg-[#EFF6FF]', accent: 'bg-[#DBEAFE]', text: 'text-blue-700', border: 'border-blue-200' };
    case 'LISTENING':
      return { base: 'bg-[#F5F3FF]', accent: 'bg-[#EDE9FE]', text: 'text-purple-700', border: 'border-purple-200' };
    case 'TYPING_SPELLING':
      return { base: 'bg-[#FFFBEB]', accent: 'bg-[#FEF3C7]', text: 'text-yellow-700', border: 'border-yellow-200' };
    case 'MATCHING':
      return { base: 'bg-[#ECFEFF]', accent: 'bg-[#CFFAFE]', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'SPEAKING':
      return { base: 'bg-[#FDF2F8]', accent: 'bg-[#FCE7F3]', text: 'text-pink-700', border: 'border-pink-200' };
    default:
      return { base: 'bg-white', accent: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
};
