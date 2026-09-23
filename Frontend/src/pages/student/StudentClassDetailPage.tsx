import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Loader2, 
  Calendar, 
  BookOpen, 
  Library, 
  Edit3, 
  CheckCircle, 
  ArrowLeft,
  Headphones,
  MessageCircle,
  Compass,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  vocabularyCount: number;
  readingCount: number;
  writingCount: number;
  teacherName?: string;
}

interface ScheduleItem {
  skill: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  isOverride: boolean;
}

interface VocabularyUnit {
  id: number;
  title: string;
  description: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
}

interface ReadingAssignment {
  id: number;
  title: string;
  durationMinutes: number;
  questionCount: number;
  attemptCount: number;
  latestSubmittedAttemptId?: number | null;
  activeAttemptId?: number | null;
}

interface SkillContext {
  skill: string;
  isHosted: boolean;
  homeClassId: number;
  homeClassName: string;
  hostClassId?: number;
  hostClassName?: string;
  assignmentType?: string;
}

interface RawMilestone {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  sortOrder?: number;
  SortOrder?: number;
  isCompleted?: boolean;
  IsCompleted?: boolean;
  completedAt?: string | null;
  CompletedAt?: string | null;
}

interface RawStage {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  sortOrder?: number;
  SortOrder?: number;
  totalMilestones?: number;
  TotalMilestones?: number;
  completedMilestones?: number;
  CompletedMilestones?: number;
  isCurrentStage?: boolean;
  IsCurrentStage?: boolean;
  milestones?: RawMilestone[];
  Milestones?: RawMilestone[];
}

interface RawProgressResponse {
  hasStages?: boolean;
  HasStages?: boolean;
  offeringId?: number;
  OfferingId?: number;
  skill?: string;
  Skill?: string;
  className?: string;
  ClassName?: string;
  isHostClass?: boolean;
  IsHostClass?: boolean;
  totalMilestones?: number;
  TotalMilestones?: number;
  completedMilestones?: number;
  CompletedMilestones?: number;
  progressPercent?: number;
  ProgressPercent?: number;
  currentStage?: {
    id?: number;
    Id?: number;
    name?: string;
    Name?: string;
    sortOrder?: number;
    SortOrder?: number;
  } | null;
  CurrentStage?: {
    id?: number;
    Id?: number;
    name?: string;
    Name?: string;
    sortOrder?: number;
    SortOrder?: number;
  } | null;
  stages?: RawStage[];
  Stages?: RawStage[];
  message?: string;
  Message?: string;
}

interface NormalizedMilestone {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

interface NormalizedStage {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  totalMilestones: number;
  completedMilestones: number;
  isCurrentStage: boolean;
  milestones: NormalizedMilestone[];
}

interface NormalizedRoadmapData {
  hasStages: boolean;
  skill: string;
  className: string;
  isHostClass: boolean;
  totalMilestones: number;
  completedMilestones: number;
  progressPercent: number;
  currentStage: {
    id: number;
    name: string;
    sortOrder: number;
  } | null;
  stages: NormalizedStage[];
}

type RoadmapSkillType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';

const ROADMAP_SKILLS: { key: RoadmapSkillType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'READING', label: 'Reading', icon: BookOpen },
  { key: 'LISTENING', label: 'Listening', icon: Headphones },
  { key: 'WRITING', label: 'Writing', icon: Edit3 },
  { key: 'SPEAKING', label: 'Speaking', icon: MessageCircle },
];

function normalizeRoadmapProgress(raw: RawProgressResponse | null): NormalizedRoadmapData | null {
  if (!raw) return null;
  const currentStageRaw = raw.currentStage || raw.CurrentStage;
  const stagesRaw = raw.stages || raw.Stages || [];

  return {
    hasStages: Boolean(raw.hasStages ?? raw.HasStages),
    skill: raw.skill || raw.Skill || '',
    className: raw.className || raw.ClassName || '',
    isHostClass: Boolean(raw.isHostClass ?? raw.IsHostClass),
    totalMilestones: raw.totalMilestones ?? raw.TotalMilestones ?? 0,
    completedMilestones: raw.completedMilestones ?? raw.CompletedMilestones ?? 0,
    progressPercent: raw.progressPercent ?? raw.ProgressPercent ?? 0,
    currentStage: currentStageRaw ? {
      id: currentStageRaw.id ?? currentStageRaw.Id ?? 0,
      name: currentStageRaw.name ?? currentStageRaw.Name ?? '',
      sortOrder: currentStageRaw.sortOrder ?? currentStageRaw.SortOrder ?? 0,
    } : null,
    stages: stagesRaw.map(s => {
      const ms = s.milestones || s.Milestones || [];
      return {
        id: s.id ?? s.Id ?? 0,
        name: s.name ?? s.Name ?? '',
        description: s.description ?? s.Description,
        sortOrder: s.sortOrder ?? s.SortOrder ?? 0,
        totalMilestones: s.totalMilestones ?? s.TotalMilestones ?? ms.length,
        completedMilestones: s.completedMilestones ?? s.CompletedMilestones ?? ms.filter(m => Boolean(m.isCompleted ?? m.IsCompleted)).length,
        isCurrentStage: Boolean(s.isCurrentStage ?? s.IsCurrentStage),
        milestones: ms.map(m => ({
          id: m.id ?? m.Id ?? 0,
          name: m.name ?? m.Name ?? '',
          description: m.description ?? m.Description,
          sortOrder: m.sortOrder ?? m.SortOrder ?? 0,
          isCompleted: Boolean(m.isCompleted ?? m.IsCompleted),
          completedAt: m.completedAt ?? m.CompletedAt ?? null,
        }))
      };
    })
  };
}


import { StudentSidebar } from './components/StudentSidebar';
import { StudentLearningHome } from './components/StudentLearningHome';
import { StudentReadingHome } from './components/StudentReadingHome';
import { StudentEmptySkillHome } from './components/StudentEmptySkillHome';
import { StudentBottomNav } from './components/StudentBottomNav';



const STUDENT_CLASS_TABS = ['overview', 'reading', 'writing', 'listening', 'speaking'] as const;
type StudentClassTab = typeof STUDENT_CLASS_TABS[number];

export const StudentClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTabParam = searchParams.get('tab');
  const activeTab: StudentClassTab = STUDENT_CLASS_TABS.includes(currentTabParam as any) 
    ? (currentTabParam as StudentClassTab)
    : 'overview';
  
  const setActiveTab = (tab: StudentClassTab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  useEffect(() => {
    if (!currentTabParam || !STUDENT_CLASS_TABS.includes(currentTabParam as any)) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'overview');
        return next;
      }, { replace: true });
    }
  }, [currentTabParam, setSearchParams]);
  
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [skillContexts, setSkillContexts] = useState<SkillContext[]>([]);
  const [loading, setLoading] = useState(true);

  const [vocabUnits, setVocabUnits] = useState<VocabularyUnit[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [vocabError, setVocabError] = useState(false);

  const [readings, setReadings] = useState<ReadingAssignment[]>([]);
  const [loadingReading, setLoadingReading] = useState(false);
  const [readingError, setReadingError] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const [clsData, schedData, contextData] = await Promise.all([
          api.get<ClassDetail>(`/student/classes/${id}`),
          api.get<ScheduleItem[]>(`/student/classes/${id}/schedule`).catch(() => []),
          api.get<SkillContext[]>(`/student/classes/${id}/skill-context`).catch(() => [])
        ]);
        setCls(clsData);
        setSchedule(schedData);
        setSkillContexts(contextData);
      } catch (e) {
        console.error("Lỗi tải lớp học", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  useEffect(() => {
    if (['reading', 'listening'].includes(activeTab) && vocabUnits.length === 0 && !vocabError) {
      setLoadingVocab(true);
      api.get<VocabularyUnit[]>(`/student/classes/${id}/vocabulary`)
        .then(data => setVocabUnits(data))
        .catch(e => {
          console.error("Lỗi tải từ vựng", e);
          setVocabError(true);
        })
        .finally(() => setLoadingVocab(false));
    }
  }, [activeTab, id, vocabUnits.length, vocabError]);

  useEffect(() => {
    if (['overview', 'reading'].includes(activeTab) && readings.length === 0 && !readingError) {
      setLoadingReading(true);
      api.get<ReadingAssignment[]>(`/student/classes/${id}/reading`)
        .then(data => setReadings(Array.isArray(data) ? data : []))
        .catch(e => {
          console.error("Lỗi tải reading", e);
          setReadingError(true);
        })
        .finally(() => setLoadingReading(false));
    }
  }, [activeTab, id, readings.length, readingError]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#0F5F4A]" /></div>;
  }

  if (!cls) {
    return <div className="text-center p-12 text-gray-500">Không tìm thấy lớp học.</div>;
  }

  return (
    <>
    <div className="max-w-[1400px] mx-auto pb-16 pt-6">
      <div className="mb-6 px-4 md:px-8">
        <Link to="/student" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Lớp học
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-8 items-start">
        {/* Left Sidebar */}
        <StudentSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          skillContexts={skillContexts} 
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === 'overview' && (
            <StudentLearningHome 
              cls={cls} 
              classId={id || ''}
              skillContexts={skillContexts}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reading' && (
            <StudentReadingHome 
              classId={id || ''}
              readings={readings}
              vocabUnits={vocabUnits}
            />
          )}

          {activeTab === 'writing' && (
            <StudentEmptySkillHome
              title="Writing"
              subtitle="Luyện tập kỹ năng Viết"
              icon={Edit3}
              colorClass="text-[#3B82C4]"
              bgClass="bg-[#E6F0FB]"
            />
          )}

          {activeTab === 'listening' && (
            <StudentEmptySkillHome
              title="Listening"
              subtitle="Luyện tập kỹ năng Nghe"
              icon={Headphones}
              colorClass="text-[#7C5CC4]"
              bgClass="bg-[#EEE7FB]"
              vocabUnits={vocabUnits}
            />
          )}
          
          {activeTab === 'speaking' && (
            <StudentEmptySkillHome
              title="Speaking"
              subtitle="Luyện tập kỹ năng Nói"
              icon={MessageCircle}
              colorClass="text-[#C96A2E]"
              bgClass="bg-[#FBEEDC]"
            />
          )}
        </div>
      </div>
    </div>
    <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};
