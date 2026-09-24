import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ChevronDown,
  RefreshCw,
  Info,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

// ================================================================
// Interfaces
// ================================================================

interface ClassItem {
  id: number;
  name: string;
  code?: string;
}

interface SkillOffering {
  id: number;
  classId: number;
  skill: string; // READING, LISTENING, WRITING, SPEAKING
  skillName: string;
  isActive: boolean;
  teacher: { id: string; fullName: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

interface FeedbackCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
}

interface FeedbackCriterion {
  id: number;
  name: string;
  sortOrder: number;
}

interface FeedbackTemplate {
  id: number;
  name: string;
  criteria: FeedbackCriterion[];
}

interface StudentScore {
  criterionId: number;
  scoreCode: string;
  scoreValue: number;
}

interface StudentFeedbackData {
  studentProfileId: number;
  studentName: string;
  homeClassName: string | null;
  isCrossClass: boolean;
  feedbackId: number | null;
  status: string; // NOT_STARTED | TA_DRAFT | WAITING_TEACHER | TEACHER_DRAFT | COMPLETED
  taFeedbackHtml: string | null;
  teacherFeedbackHtml: string | null;
  scores: StudentScore[];
}

interface TeacherGridResponse {
  offeringId: number;
  skill: string;
  className: string;
  template: FeedbackTemplate | null;
  scoreLegend: Record<string, number>;
  students: StudentFeedbackData[];
}

interface RowState {
  scores: Record<number, string>; // criterionId -> scoreCode
  teacherComment: string;
  isDirty: boolean;
  isSaving: boolean;
  isCompleting: boolean;
}

// ================================================================
// Constants & Styling
// ================================================================

const SCORE_OPTIONS = [
  { code: 'E', label: 'E (Xuất sắc - 6)', value: 6, bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { code: 'VG', label: 'VG (Rất tốt - 5)', value: 5, bg: 'bg-teal-100 text-teal-800 border-teal-300' },
  { code: 'G', label: 'G (Tốt - 4)', value: 4, bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { code: 'F', label: 'F (Trung bình - 3)', value: 3, bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { code: 'NI', label: 'NI (Cần cố gắng - 2)', value: 2, bg: 'bg-orange-100 text-orange-800 border-orange-300' },
  { code: 'P', label: 'P (Kém - 1)', value: 1, bg: 'bg-rose-100 text-rose-800 border-rose-300' },
];

const SKILL_THEMES: Record<string, { label: string; border: string; bg: string; text: string; lightBg: string }> = {
  READING: {
    label: 'Reading',
    border: 'border-[#1E7A57]',
    bg: 'bg-[#1E7A57]',
    text: 'text-[#1E7A57]',
    lightBg: 'bg-[#DDF4EA]'
  },
  LISTENING: {
    label: 'Listening',
    border: 'border-[#7C5CC4]',
    bg: 'bg-[#7C5CC4]',
    text: 'text-[#7C5CC4]',
    lightBg: 'bg-[#EEE7FB]'
  },
  WRITING: {
    label: 'Writing',
    border: 'border-[#3B82C4]',
    bg: 'bg-[#3B82C4]',
    text: 'text-[#3B82C4]',
    lightBg: 'bg-[#E6F0FB]'
  },
  SPEAKING: {
    label: 'Speaking',
    border: 'border-[#C96A2E]',
    bg: 'bg-[#C96A2E]',
    text: 'text-[#C96A2E]',
    lightBg: 'bg-[#FBEEDC]'
  }
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NOT_STARTED: {
    label: 'Chưa bắt đầu',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300'
  },
  TA_DRAFT: {
    label: 'TA đang soạn',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  WAITING_TEACHER: {
    label: 'Chờ GV chấm',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  TEACHER_DRAFT: {
    label: 'GV đang soạn',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300'
  }
};

// ================================================================
// Component
// ================================================================

export function TeacherFeedbackPage() {
  const { user } = useAuth();

  // Filter selections
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(null);

  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  // Loading states
  const [loadingSelectors, setLoadingSelectors] = useState(true);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);

  // Grid Data & Local State
  const [gridData, setGridData] = useState<TeacherGridResponse | null>(null);
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});

  // TA Feedback modal
  const [activeTaModal, setActiveTaModal] = useState<{
    studentName: string;
    taFeedbackHtml: string;
  } | null>(null);

  // Global notification banner
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // ----------------------------------------------------------------
  // Initial Fetch: Classes & Cycles
  // ----------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function initSelectors() {
      setLoadingSelectors(true);
      try {
        const [classesRes, cyclesRes] = await Promise.all([
          api.get<ClassItem[]>('/classes').catch(() => api.get<ClassItem[]>('/teacher/class')),
          api.get<FeedbackCycle[]>('/admin/feedback-cycles').catch(() => [])
        ]);

        if (!mounted) return;

        const classList = Array.isArray(classesRes) ? classesRes : [];
        const cycleList = Array.isArray(cyclesRes) ? cyclesRes : [];

        setClasses(classList);
        setCycles(cycleList);

        // Auto select first class if available
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }

        // Auto select active or first cycle if available
        if (cycleList.length > 0) {
          const activeCycle = cycleList.find((c) => c.status === 'ACTIVE') || cycleList[0];
          setSelectedCycleId(activeCycle.id);
        }
      } catch (err: any) {
        if (!mounted) return;
        setBannerMessage({
          type: 'error',
          text: err?.message || 'Không thể tải danh sách lớp học hoặc chu kỳ đánh giá.'
        });
      } finally {
        if (mounted) setLoadingSelectors(false);
      }
    }

    initSelectors();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------------------
  // When Class changes: fetch offerings for this class
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!selectedClassId) {
      setOfferings([]);
      setSelectedOfferingId(null);
      return;
    }

    let mounted = true;
    async function loadOfferings() {
      setLoadingOfferings(true);
      try {
        const data = await api.get<SkillOffering[]>(`/admin/classes/${selectedClassId}/skill-offerings`);
        if (!mounted) return;

        const offeringList = Array.isArray(data) ? data : [];
        setOfferings(offeringList);

        if (offeringList.length > 0) {
          // If current teacher is assigned to one of the offerings, prioritize it
          const myOffering = user?.id
            ? offeringList.find((o) => o.teacher?.id === user.id && o.isActive)
            : null;
          setSelectedOfferingId(myOffering ? myOffering.id : offeringList[0].id);
        } else {
          setSelectedOfferingId(null);
        }
      } catch (err: any) {
        if (!mounted) return;
        setBannerMessage({
          type: 'error',
          text: 'Lỗi tải danh sách kỹ năng của lớp học.'
        });
        setOfferings([]);
        setSelectedOfferingId(null);
      } finally {
        if (mounted) setLoadingOfferings(false);
      }
    }

    loadOfferings();

    return () => {
      mounted = false;
    };
  }, [selectedClassId, user?.id]);

  // ----------------------------------------------------------------
  // When Offering or Cycle changes: load grid
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!selectedOfferingId || !selectedCycleId) {
      setGridData(null);
      setRowStates({});
      return;
    }

    let mounted = true;
    async function loadGrid() {
      setLoadingGrid(true);
      setBannerMessage(null);
      try {
        const res = await api.get<TeacherGridResponse>(
          `/feedback/teacher/offerings/${selectedOfferingId}/cycles/${selectedCycleId}`
        );
        if (!mounted) return;

        setGridData(res);

        // Initialize editable states for all students
        const initialStates: Record<number, RowState> = {};
        if (res.students && Array.isArray(res.students)) {
          res.students.forEach((st) => {
            const scoreMap: Record<number, string> = {};
            if (st.scores) {
              st.scores.forEach((s) => {
                scoreMap[s.criterionId] = s.scoreCode;
              });
            }
            initialStates[st.studentProfileId] = {
              scores: scoreMap,
              teacherComment: st.teacherFeedbackHtml || '',
              isDirty: false,
              isSaving: false,
              isCompleting: false
            };
          });
        }
        setRowStates(initialStates);
      } catch (err: any) {
        if (!mounted) return;
        setBannerMessage({
          type: 'error',
          text: err?.message || 'Không thể tải bảng đánh giá học viên.'
        });
        setGridData(null);
      } finally {
        if (mounted) setLoadingGrid(false);
      }
    }

    loadGrid();

    return () => {
      mounted = false;
    };
  }, [selectedOfferingId, selectedCycleId]);

  // ----------------------------------------------------------------
  // Input change handlers
  // ----------------------------------------------------------------
  const handleScoreChange = (studentProfileId: number, criterionId: number, scoreCode: string) => {
    setRowStates((prev) => {
      const current = prev[studentProfileId] || {
        scores: {},
        teacherComment: '',
        isDirty: false,
        isSaving: false,
        isCompleting: false
      };
      return {
        ...prev,
        [studentProfileId]: {
          ...current,
          scores: {
            ...current.scores,
            [criterionId]: scoreCode
          },
          isDirty: true
        }
      };
    });
  };

  const handleCommentChange = (studentProfileId: number, comment: string) => {
    setRowStates((prev) => {
      const current = prev[studentProfileId] || {
        scores: {},
        teacherComment: '',
        isDirty: false,
        isSaving: false,
        isCompleting: false
      };
      return {
        ...prev,
        [studentProfileId]: {
          ...current,
          teacherComment: comment,
          isDirty: true
        }
      };
    });
  };

  // ----------------------------------------------------------------
  // Save / Complete single row
  // ----------------------------------------------------------------
  const handleSaveStudent = async (student: StudentFeedbackData, complete: boolean) => {
    if (!student.feedbackId) {
      alert('Học sinh này chưa có bản ghi feedback từ TA.');
      return;
    }

    const state = rowStates[student.studentProfileId];
    if (!state) return;

    // Set row saving/completing flag
    setRowStates((prev) => ({
      ...prev,
      [student.studentProfileId]: {
        ...prev[student.studentProfileId],
        isSaving: !complete,
        isCompleting: complete
      }
    }));

    try {
      const scoresPayload = Object.entries(state.scores)
        .filter(([, code]) => !!code)
        .map(([cId, code]) => ({
          criterionId: Number(cId),
          scoreCode: code
        }));

      const res = await api.put<{ feedbackId: number; status: string }>(
        `/feedback/teacher/feedbacks/${student.feedbackId}`,
        {
          teacherFeedbackHtml: state.teacherComment,
          scores: scoresPayload,
          complete
        }
      );

      // Update student data status and reset dirty flag
      setGridData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.studentProfileId === student.studentProfileId
              ? {
                  ...s,
                  status: res.status,
                  teacherFeedbackHtml: state.teacherComment
                }
              : s
          )
        };
      });

      setRowStates((prev) => ({
        ...prev,
        [student.studentProfileId]: {
          ...prev[student.studentProfileId],
          isDirty: false,
          isSaving: false,
          isCompleting: false
        }
      }));

      setBannerMessage({
        type: 'success',
        text: complete
          ? `Đã hoàn thành đánh giá cho học viên "${student.studentName}".`
          : `Đã lưu bản nháp cho học viên "${student.studentName}".`
      });
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err?.message || `Lỗi khi lưu đánh giá cho ${student.studentName}.`
      });
      setRowStates((prev) => ({
        ...prev,
        [student.studentProfileId]: {
          ...prev[student.studentProfileId],
          isSaving: false,
          isCompleting: false
        }
      }));
    }
  };

  // ----------------------------------------------------------------
  // Batch Save all dirty rows
  // ----------------------------------------------------------------
  const handleBatchSave = async () => {
    if (!gridData || !gridData.students) return;

    const dirtyStudents = gridData.students.filter((s) => {
      const state = rowStates[s.studentProfileId];
      return s.feedbackId && state && state.isDirty;
    });

    if (dirtyStudents.length === 0) {
      setBannerMessage({
        type: 'info',
        text: 'Không có thay đổi nào cần lưu.'
      });
      return;
    }

    setBatchSaving(true);
    setBannerMessage(null);

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      dirtyStudents.map(async (student) => {
        const state = rowStates[student.studentProfileId];
        try {
          const scoresPayload = Object.entries(state.scores)
            .filter(([, code]) => !!code)
            .map(([cId, code]) => ({
              criterionId: Number(cId),
              scoreCode: code
            }));

          const res = await api.put<{ feedbackId: number; status: string }>(
            `/feedback/teacher/feedbacks/${student.feedbackId}`,
            {
              teacherFeedbackHtml: state.teacherComment,
              scores: scoresPayload,
              complete: false
            }
          );

          setGridData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              students: prev.students.map((s) =>
                s.studentProfileId === student.studentProfileId
                  ? {
                      ...s,
                      status: res.status,
                      teacherFeedbackHtml: state.teacherComment
                    }
                  : s
              )
            };
          });

          setRowStates((prev) => ({
            ...prev,
            [student.studentProfileId]: {
              ...prev[student.studentProfileId],
              isDirty: false
            }
          }));

          successCount++;
        } catch {
          failCount++;
        }
      })
    );

    setBatchSaving(false);
    if (failCount === 0) {
      setBannerMessage({
        type: 'success',
        text: `Đã lưu thành công thay đổi cho toàn bộ ${successCount} học viên!`
      });
    } else {
      setBannerMessage({
        type: 'error',
        text: `Lưu hoàn tất: ${successCount} thành công, ${failCount} thất bại. Vui lòng kiểm tra lại.`
      });
    }
  };

  // ----------------------------------------------------------------
  // Helper calculations
  // ----------------------------------------------------------------
  const currentOffering = offerings.find((o) => o.id === selectedOfferingId);
  const currentSkillTheme = currentOffering ? SKILL_THEMES[currentOffering.skill] : null;

  const dirtyCount = useMemo(() => {
    return Object.values(rowStates).filter((s) => s.isDirty).length;
  }, [rowStates]);

  const stats = useMemo(() => {
    if (!gridData || !gridData.students) return { total: 0, waiting: 0, drafts: 0, completed: 0, notStarted: 0 };
    const students = gridData.students;
    return {
      total: students.length,
      waiting: students.filter((s) => s.status === 'WAITING_TEACHER').length,
      drafts: students.filter((s) => s.status === 'TEACHER_DRAFT').length,
      completed: students.filter((s) => s.status === 'COMPLETED').length,
      notStarted: students.filter((s) => s.status === 'NOT_STARTED' || s.status === 'TA_DRAFT').length
    };
  }, [gridData]);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <TeacherLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F5F4A]/10 text-[#0F5F4A] flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Đánh giá định kỳ & Feedback
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Bảng chấm điểm rubric & ghi nhận xét học viên theo kỹ năng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dirtyCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                Có {dirtyCount} thay đổi chưa lưu
              </span>
            )}
            <button
              onClick={handleBatchSave}
              disabled={batchSaving || dirtyCount === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                dirtyCount > 0
                  ? 'bg-[#0F5F4A] hover:bg-[#1D7A61] text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              {batchSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Lưu tất cả thay đổi</span>
            </button>
          </div>
        </div>

        {/* Banner message */}
        {bannerMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : bannerMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {bannerMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {bannerMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span>{bannerMessage.text}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selectors Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Class Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                1. Lớp học
              </label>
              <div className="relative">
                <select
                  value={selectedClassId ?? ''}
                  onChange={(e) => setSelectedClassId(Number(e.target.value) || null)}
                  disabled={loadingSelectors || classes.length === 0}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-transparent transition-all pr-10 disabled:opacity-60"
                >
                  {classes.length === 0 && <option value="">Không có lớp học nào</option>}
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. Skill Offering Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                2. Kỹ năng phụ trách
              </label>
              <div className="relative">
                <select
                  value={selectedOfferingId ?? ''}
                  onChange={(e) => setSelectedOfferingId(Number(e.target.value) || null)}
                  disabled={loadingOfferings || offerings.length === 0}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-transparent transition-all pr-10 disabled:opacity-60"
                >
                  {offerings.length === 0 && <option value="">(Chưa thiết lập kỹ năng)</option>}
                  {offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.skillName || o.skill}{' '}
                      {o.teacher?.fullName ? `— GV: ${o.teacher.fullName}` : '— (Chưa gán GV)'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  {loadingOfferings ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F5F4A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* 3. Cycle Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                3. Chu kỳ đánh giá
              </label>
              <div className="relative">
                <select
                  value={selectedCycleId ?? ''}
                  onChange={(e) => setSelectedCycleId(Number(e.target.value) || null)}
                  disabled={loadingSelectors || cycles.length === 0}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-transparent transition-all pr-10 disabled:opacity-60"
                >
                  {cycles.length === 0 && <option value="">Không có chu kỳ nào</option>}
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.status === 'ACTIVE' ? '⭐ (Đang mở)' : `(${c.status})`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI stats if grid is loaded */}
        {gridData && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Tổng học viên</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-3 shadow-sm">
              <span className="text-xs font-semibold text-amber-700">Chờ GV chấm</span>
              <p className="text-xl font-bold text-amber-800 mt-0.5">{stats.waiting}</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm">
              <span className="text-xs font-semibold text-blue-700">Đang soạn dở</span>
              <p className="text-xl font-bold text-blue-800 mt-0.5">{stats.drafts}</p>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-sm">
              <span className="text-xs font-semibold text-emerald-700">Đã hoàn thành</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{stats.completed}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Chưa bắt đầu / TA soạn</span>
              <p className="text-xl font-bold text-gray-600 mt-0.5">{stats.notStarted}</p>
            </div>
          </div>
        )}

        {/* Score Legend Banner */}
        <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Thang điểm Rubric chuẩn (Score Legend)</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Nhấn <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[11px] font-mono">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[11px] font-mono">Shift+Tab</kbd> để di chuyển nhanh giữa các ô điểm trong hàng.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {SCORE_OPTIONS.map((item) => (
                <div
                  key={item.code}
                  className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 shadow-2xs ${item.bg}`}
                >
                  <span className="font-bold">{item.code}</span>
                  <span className="text-[11px] opacity-80">= {item.value}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid View Area */}
        {loadingGrid ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F5F4A]" />
            <p className="text-sm font-semibold text-gray-600">Đang tải bảng điểm rubric...</p>
          </div>
        ) : !selectedClassId || !selectedOfferingId || !selectedCycleId ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              Vui lòng chọn đầy đủ Lớp học, Kỹ năng và Chu kỳ để tải bảng đánh giá.
            </p>
          </div>
        ) : !gridData?.template ? (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-amber-900">
              Chưa thiết lập Tiêu chí Rubric cho kỹ năng {currentOffering?.skillName || currentOffering?.skill}
            </h3>
            <p className="text-sm text-amber-700 mt-1 max-w-md mx-auto">
              Hệ thống cần ít nhất một mẫu tiêu chí đánh giá (Feedback Template) đang hoạt động cho kỹ năng này trước khi bắt đầu chấm điểm.
            </p>
          </div>
        ) : gridData.students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-500">
              Không có học viên nào trong danh sách lớp hoặc phân công kỹ năng này.
            </p>
          </div>
        ) : (
          /* Spreadsheet Grid Table */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header info badge */}
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Mẫu tiêu chí:</span>
                <span className="font-semibold text-gray-900">{gridData.template.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">({gridData.template.criteria.length} tiêu chí)</span>
              </div>
              <div className="flex items-center gap-2">
                {currentSkillTheme && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentSkillTheme.lightBg} ${currentSkillTheme.text}`}
                  >
                    {currentSkillTheme.label}
                  </span>
                )}
                <span className="text-gray-500">
                  Lớp: <strong className="text-gray-800">{gridData.className}</strong>
                </span>
              </div>
            </div>

            {/* Scrollable Spreadsheet Table */}
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-gray-100 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    {/* Sticky Column 1: # (Row Number) */}
                    <th className="sticky left-0 z-20 bg-gray-100 px-3 py-3 w-12 text-center border-r border-gray-200 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                      #
                    </th>

                    {/* Sticky Column 2: Student Name */}
                    <th className="sticky left-12 z-20 bg-gray-100 px-4 py-3 min-w-[190px] border-r border-gray-200 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                      Học viên
                    </th>

                    {/* Sticky Column 3: Home Class */}
                    <th className="sticky left-[238px] z-20 bg-gray-100 px-3 py-3 min-w-[130px] border-r border-gray-200 shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]">
                      Lớp học
                    </th>

                    {/* Dynamic Criteria Columns */}
                    {gridData.template.criteria.map((crit) => (
                      <th
                        key={crit.id}
                        className="px-3 py-3 min-w-[125px] text-center border-r border-gray-200 whitespace-normal"
                      >
                        <div className="leading-tight" title={crit.name}>
                          {crit.name}
                        </div>
                      </th>
                    ))}

                    {/* Teacher Feedback Column */}
                    <th className="px-4 py-3 min-w-[260px] border-r border-gray-200">
                      Nhận xét của Giáo viên
                    </th>

                    {/* TA Feedback Column */}
                    <th className="px-3 py-3 min-w-[110px] text-center border-r border-gray-200">
                      Nhận xét TA
                    </th>

                    {/* Status Column */}
                    <th className="px-3 py-3 min-w-[130px] text-center border-r border-gray-200">
                      Trạng thái
                    </th>

                    {/* Actions Column */}
                    <th className="px-4 py-3 min-w-[160px] text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-xs">
                  {gridData.students.map((student, idx) => {
                    const rowState = rowStates[student.studentProfileId] || {
                      scores: {},
                      teacherComment: '',
                      isDirty: false,
                      isSaving: false,
                      isCompleting: false
                    };

                    const isNotStarted = !student.feedbackId || student.status === 'NOT_STARTED';
                    const isTaDraft = student.status === 'TA_DRAFT';
                    const isCompleted = student.status === 'COMPLETED';
                    const isEditable = !isNotStarted && !isTaDraft && !isCompleted;

                    // Row background styling
                    let rowBgClass = 'bg-white hover:bg-gray-50/60';
                    let stickyBgClass = 'bg-white';
                    if (isCompleted) {
                      rowBgClass = 'bg-emerald-50/50 hover:bg-emerald-50/70';
                      stickyBgClass = 'bg-[#F2FBF6]';
                    } else if (isNotStarted || isTaDraft) {
                      rowBgClass = 'bg-gray-50/70 text-gray-400';
                      stickyBgClass = 'bg-[#F9FAFB]';
                    } else if (student.status === 'WAITING_TEACHER') {
                      rowBgClass = 'bg-amber-50/30 hover:bg-amber-50/50';
                      stickyBgClass = 'bg-[#FEFAF3]';
                    } else if (student.status === 'TEACHER_DRAFT') {
                      rowBgClass = 'bg-blue-50/30 hover:bg-blue-50/50';
                      stickyBgClass = 'bg-[#F6FAFE]';
                    }

                    const statusInfo = STATUS_CONFIG[student.status] || {
                      label: student.status,
                      bg: 'bg-gray-100',
                      text: 'text-gray-700',
                      border: 'border-gray-300'
                    };

                    return (
                      <tr key={student.studentProfileId} className={`${rowBgClass} transition-colors`}>
                        {/* 1. # Column */}
                        <td
                          className={`sticky left-0 z-10 ${stickyBgClass} px-3 py-3 text-center font-mono text-gray-500 font-bold border-r border-gray-200 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]`}
                        >
                          {idx + 1}
                        </td>

                        {/* 2. Student Name Column */}
                        <td
                          className={`sticky left-12 z-10 ${stickyBgClass} px-4 py-3 border-r border-gray-200 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]`}
                        >
                          <div className="font-bold text-gray-900 leading-tight">
                            {student.studentName}
                          </div>
                          {student.isCrossClass && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              Học chéo
                            </span>
                          )}
                        </td>

                        {/* 3. Class Column */}
                        <td
                          className={`sticky left-[238px] z-10 ${stickyBgClass} px-3 py-3 border-r border-gray-200 shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]`}
                        >
                          {student.isCrossClass && student.homeClassName ? (
                            <span
                              className="inline-block text-[11px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md"
                              title={`Lớp chính: ${student.homeClassName}`}
                            >
                              Lớp chính: {student.homeClassName}
                            </span>
                          ) : (
                            <span className="text-gray-600 font-medium">Lớp hiện tại</span>
                          )}
                        </td>

                        {/* 4. Dynamic Criteria Score Selects */}
                        {gridData.template?.criteria.map((crit) => {
                          const currentScoreCode = rowState.scores[crit.id] || '';
                          const scoreObj = SCORE_OPTIONS.find((s) => s.code === currentScoreCode);

                          let selectBorderClass = 'border-gray-200';
                          let selectBgClass = 'bg-white text-gray-700';

                          if (scoreObj) {
                            selectBorderClass = scoreObj.bg;
                            selectBgClass = `${scoreObj.bg} font-bold`;
                          }

                          return (
                            <td
                              key={crit.id}
                              className="px-2 py-2 text-center border-r border-gray-200"
                            >
                              {isNotStarted || isTaDraft ? (
                                <span className="text-gray-400 font-mono">-</span>
                              ) : isCompleted ? (
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg border font-bold text-xs ${
                                    scoreObj ? scoreObj.bg : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  {currentScoreCode || '—'}
                                </span>
                              ) : (
                                <select
                                  value={currentScoreCode}
                                  onChange={(e) =>
                                    handleScoreChange(student.studentProfileId, crit.id, e.target.value)
                                  }
                                  className={`w-full py-1.5 px-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] transition-all cursor-pointer ${selectBgClass}`}
                                >
                                  <option value="">— Chưa chấm —</option>
                                  {SCORE_OPTIONS.map((opt) => (
                                    <option key={opt.code} value={opt.code}>
                                      {opt.code} ({opt.value}đ)
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          );
                        })}

                        {/* 5. Teacher Comment Input */}
                        <td className="px-3 py-2 border-r border-gray-200">
                          {isNotStarted || isTaDraft ? (
                            <span className="text-gray-400 italic">
                              {isNotStarted ? 'Chờ TA viết nhận xét' : 'Chờ TA gửi nhận xét'}
                            </span>
                          ) : isCompleted ? (
                            <div className="text-gray-700 text-xs line-clamp-2 max-w-[280px]">
                              {rowState.teacherComment || <span className="italic text-gray-400">(Không có nhận xét)</span>}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={rowState.teacherComment}
                              onChange={(e) =>
                                handleCommentChange(student.studentProfileId, e.target.value)
                              }
                              placeholder="Nhập nhận xét của giáo viên..."
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-transparent transition-all bg-white"
                            />
                          )}
                        </td>

                        {/* 6. TA Feedback Preview */}
                        <td className="px-2 py-2 text-center border-r border-gray-200">
                          {student.taFeedbackHtml ? (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTaModal({
                                  studentName: student.studentName,
                                  taFeedbackHtml: student.taFeedbackHtml!
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                              title="Nhấn để xem đầy đủ nhận xét của TA"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Xem</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* 7. Status Badge */}
                        <td className="px-3 py-2 text-center border-r border-gray-200">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* 8. Action Buttons */}
                        <td className="px-3 py-2 text-center">
                          {isNotStarted ? (
                            <span className="text-[11px] text-gray-400 italic">
                              Chờ TA viết nhận xét
                            </span>
                          ) : isTaDraft ? (
                            <span className="text-[11px] text-amber-700 italic">
                              TA chưa nộp
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Đã hoàn thành
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveStudent(student, false)}
                                disabled={rowState.isSaving || rowState.isCompleting}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1 border border-gray-200"
                                title="Lưu nháp"
                              >
                                {rowState.isSaving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Save className="w-3 h-3 text-gray-600" />
                                )}
                                <span>Lưu</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveStudent(student, true)}
                                disabled={rowState.isSaving || rowState.isCompleting}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#0F5F4A] hover:bg-[#1D7A61] text-white transition-colors flex items-center gap-1 shadow-2xs"
                                title="Chốt và hoàn thành"
                              >
                                {rowState.isCompleting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Hoàn thành</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>
                Hiển thị <strong>{gridData.students.length}</strong> học viên
              </span>
              <span>Hệ thống chấm điểm định kỳ MLC</span>
            </div>
          </div>
        )}

        {/* Modal: View TA Feedback */}
        {activeTaModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-purple-700" />
                  <span>Nhận xét của Trợ giảng (TA)</span>
                </div>
                <button
                  onClick={() => setActiveTaModal(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3">
                <div className="text-xs text-gray-500">
                  Học viên: <strong className="text-gray-900 text-sm">{activeTaModal.studentName}</strong>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {/* If TA comments contain HTML, safely render */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: activeTaModal.taFeedbackHtml
                    }}
                  />
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setActiveTaModal(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

export default TeacherFeedbackPage;
