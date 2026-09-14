/**
 * OFFLINE / PAPER-FIRST COMPATIBILITY PRINCIPLE:
 * Student learning activities may be delivered digitally, on paper, or in a
 * hybrid classroom model. Digital submission must not be assumed for every future
 * assignment type. The software should complement classroom teaching, not replace paper.
 */
export type SkillType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
export type SkillStatus = 'ACTIVE' | 'COMING_SOON';

export interface SkillMetadata {
  id: SkillType;
  label: string;
  description: string;
  status: SkillStatus;
  accentClass: string;
  route: string;
  comingSoonMessage?: string;
}

export const SKILL_REGISTRY: Record<SkillType, SkillMetadata> = {
  READING: {
    id: 'READING',
    label: 'Reading',
    description: 'Từ vựng & bài đọc',
    status: 'ACTIVE',
    accentClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    route: '/student/reading',
  },
  LISTENING: {
    id: 'LISTENING',
    label: 'Listening',
    description: 'Luyện nghe',
    status: 'COMING_SOON',
    accentClass: 'bg-purple-50 text-purple-700 border-purple-200',
    route: '/student/listening',
    comingSoonMessage: 'Tính năng luyện kỹ năng Listening với bài tập do giáo viên giao đang được phát triển.',
  },
  WRITING: {
    id: 'WRITING',
    label: 'Writing',
    description: 'Luyện viết',
    status: 'COMING_SOON',
    accentClass: 'bg-blue-50 text-blue-700 border-blue-200',
    route: '/student/writing',
    comingSoonMessage: 'Tính năng giao bài viết và nhận phản hồi chi tiết từ giáo viên đang được phát triển.',
  },
  SPEAKING: {
    id: 'SPEAKING',
    label: 'Speaking',
    description: 'Luyện nói',
    status: 'COMING_SOON',
    accentClass: 'bg-orange-50 text-orange-700 border-orange-200',
    route: '/student/speaking',
    comingSoonMessage: 'Tính năng luyện kỹ năng Speaking và chấm điểm đang được phát triển.',
  },
};

export const SKILLS_LIST = [
  SKILL_REGISTRY.READING,
  SKILL_REGISTRY.LISTENING,
  SKILL_REGISTRY.WRITING,
  SKILL_REGISTRY.SPEAKING,
];
