export interface ActivityDefinition {
  type: string;
  displayName: string;
  category: 'RECOGNITION' | 'LISTENING' | 'TYPING_SPELLING' | 'MATCHING' | 'SPEAKING';
  description: string;
}

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  { type: 'WORD_TO_MEANING', displayName: 'Từ → Chọn nghĩa', category: 'RECOGNITION', description: 'Hiển thị từ tiếng Anh, chọn nghĩa tiếng Việt chính xác' },
  { type: 'MEANING_TO_WORD', displayName: 'Nghĩa → Chọn từ', category: 'RECOGNITION', description: 'Hiển thị nghĩa tiếng Việt, chọn từ tiếng Anh tương ứng' },
  { type: 'LISTEN_TO_WORD', displayName: 'Nghe → Chọn từ', category: 'LISTENING', description: 'Phát âm thanh từ vựng, chọn từ tiếng Anh đúng' },
  { type: 'LISTEN_TO_MEANING', displayName: 'Nghe → Chọn nghĩa', category: 'LISTENING', description: 'Phát âm thanh từ vựng, chọn nghĩa tiếng Việt đúng' },
  { type: 'MEANING_TO_TYPE_WORD', displayName: 'Nghĩa → Điền từ', category: 'TYPING_SPELLING', description: 'Cho nghĩa tiếng Việt, học sinh gõ lại từ tiếng Anh' },
  { type: 'LISTEN_TO_TYPE_WORD', displayName: 'Nghe → Điền từ', category: 'TYPING_SPELLING', description: 'Nghe phát âm chuẩn, gõ lại từ vựng chính xác' },
  { type: 'WORD_TO_TYPE_MEANING', displayName: 'Từ → Điền nghĩa', category: 'TYPING_SPELLING', description: 'Cho từ tiếng Anh, học sinh gõ lại nghĩa tiếng Việt' },
  { type: 'MISSING_LETTERS', displayName: 'Điền chữ còn thiếu', category: 'TYPING_SPELLING', description: 'Ẩn 1-2 ký tự trong từ, học sinh hoàn thiện từ' },
  { type: 'UNSCRAMBLE_WORD', displayName: 'Sắp xếp chữ thành từ', category: 'TYPING_SPELLING', description: 'Xáo trộn thứ tự các chữ cái, sắp xếp thành từ đúng' },
  { type: 'MATCH_WORD_MEANING', displayName: 'Ghép Từ ↔ Nghĩa', category: 'MATCHING', description: 'Ghép cặp thẻ từ vựng với nghĩa tương ứng' },
  { type: 'PRONUNCIATION', displayName: 'Phát âm', category: 'SPEAKING', description: 'Học sinh đọc từ vựng vào micro để chấm điểm' }
];
