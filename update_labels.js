const fs = require('fs');

let content = fs.readFileSync('Frontend/src/i18n/labels.ts', 'utf8');
content = content.replace(/vi: 'Ôn tập'/g, "vi: 'Ôn từ'");
content = content.replace(/vi: 'A"n t-p'/g, "vi: 'Ôn từ'"); // handle possible ascii escaping just in case

// Wait, let's just write the exact file content completely cleanly to avoid any encoding weirdness.
const newContent = `export const vocabularyLabels = {
  vocabulary: { en: 'Vocabulary', vi: 'Từ vựng' },
  vocabularySets: { en: 'Vocabulary Sets', vi: 'Nhóm từ vựng' },
  vocabularySet: { en: 'Vocabulary Set', vi: 'Nhóm từ vựng' },
  words: { en: 'words', vi: 'từ' },
  viewVocabulary: { en: 'View Vocabulary', vi: 'Xem từ vựng' },
  review: { en: 'Review', vi: 'Ôn từ' },
  continueReview: { en: 'Continue Review', vi: 'Tiếp tục ôn từ' },
  startReview: { en: 'Start Review', vi: 'Bắt đầu ôn từ' },
  emptyStateTitle: { en: 'No Vocabulary Sets yet', vi: 'Giáo viên chưa thêm nhóm từ vựng cho kỹ năng này.' },
  readingVocabulary: { en: 'Reading Vocabulary', vi: 'Từ vựng Đọc hiểu' },
  listeningVocabulary: { en: 'Listening Vocabulary', vi: 'Từ vựng Nghe' },
  teacherPreparedSets: { en: 'Vocabulary Sets prepared by your teacher', vi: 'Các nhóm từ vựng được giáo viên chuẩn bị cho lớp của bạn' },
  vocabularyForReading: { en: 'Vocabulary for Reading', vi: 'Từ vựng Đọc hiểu' },
  vocabularyForListening: { en: 'Vocabulary for Listening', vi: 'Từ vựng Nghe' }
};`;

fs.writeFileSync('Frontend/src/i18n/labels.ts', newContent);
console.log('Labels updated');
