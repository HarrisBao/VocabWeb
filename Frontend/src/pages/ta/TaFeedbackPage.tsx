import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Check,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { TaLayout } from '../../components/layout/TaLayout';

// ==========================================
// TYPES & DEFINITIONS
// ==========================================

export interface FeedbackCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
}

export type SkillType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';

export type FeedbackStatus =
  | 'NOT_STARTED'
  | 'TA_DRAFT'
  | 'WAITING_TEACHER'
  | 'TEACHER_DRAFT'
  | 'COMPLETED'
  | 'HOSTED_AWAY'
  | 'NOT_APPLICABLE';

export interface SkillFeedbackInfo {
  status: FeedbackStatus;
  feedbackId: number | null;
  taFeedbackHtml?: string | null;
}

export interface StudentFeedbackItem {
  enrollmentId: number;
  studentProfileId: number;
  studentName: string;
  type: 'HOME' | 'CROSS';
  feedbackBySkill: Record<SkillType, SkillFeedbackInfo>;
}

interface SkillConfig {
  key: SkillType;
  shortLabel: string;
  nameVi: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SKILLS: SkillConfig[] = [
  {
    key: 'READING',
    shortLabel: 'R',
    nameVi: 'Reading (Đọc)',
    color: '#1E7A57',
    bgColor: '#DDF4EA',
    borderColor: '#A3E3CA',
  },
  {
    key: 'LISTENING',
    shortLabel: 'L',
    nameVi: 'Listening (Nghe)',
    color: '#7C5CC4',
    bgColor: '#EEE7FB',
    borderColor: '#D4C4F5',
  },
  {
    key: 'WRITING',
    shortLabel: 'W',
    nameVi: 'Writing (Viết)',
    color: '#3B82C4',
    bgColor: '#E6F0FB',
    borderColor: '#BAD8F7',
  },
  {
    key: 'SPEAKING',
    shortLabel: 'S',
    nameVi: 'Speaking (Nói)',
    color: '#C96A2E',
    bgColor: '#FBEEDC',
    borderColor: '#F5CE9F',
  },
];

// Status badge helper
function renderStatusBadge(status: FeedbackStatus) {
  switch (status) {
    case 'HOSTED_AWAY':
      return (
        <span
          title="Học kỹ năng này ở lớp khác"
          className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-600 border border-gray-200"
        >
          Lớp khác
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span title="Không áp dụng" className="text-gray-300 font-bold text-xs select-none">
          -
        </span>
      );
    case 'NOT_STARTED':
      return (
        <span
          title="Chưa bắt đầu"
          className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 inline-block hover:border-gray-400 transition-colors"
        />
      );
    case 'TA_DRAFT':
      return (
        <span
          title="Bản nháp của Trợ giảng"
          className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200"
        >
          Nháp
        </span>
      );
    case 'WAITING_TEACHER':
      return (
        <span
          title="Đã gửi cho Giáo viên xem xét"
          className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200"
        >
          Chờ GV
        </span>
      );
    case 'TEACHER_DRAFT':
      return (
        <span
          title="Giáo viên đang chỉnh sửa / chấm điểm"
          className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded bg-purple-100 text-purple-800 border border-purple-200"
        >
          GV sửa
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          title="Đã hoàn thành đánh giá"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      );
    default:
      return null;
  }
}

function getStatusTitleVi(status: FeedbackStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Chưa bắt đầu';
    case 'TA_DRAFT':
      return 'Bản nháp TA';
    case 'WAITING_TEACHER':
      return 'Đã gửi - Chờ Giáo viên duyệt';
    case 'TEACHER_DRAFT':
      return 'Giáo viên đang chỉnh sửa';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    case 'HOSTED_AWAY':
      return 'Học ở lớp khác';
    case 'NOT_APPLICABLE':
      return 'Không áp dụng';
    default:
      return status;
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TaFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const classId = id ? parseInt(id, 10) : null;

  // Cycles state
  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [loadingCycles, setLoadingCycles] = useState<boolean>(true);

  // Students state
  const [students, setStudents] = useState<StudentFeedbackItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selection & Editor state
  const [selectedStudent, setSelectedStudent] = useState<StudentFeedbackItem | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('READING');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [drafts, setDrafts] = useState<Record<string, string>>({}); // key: `${studentProfileId}_${skill}`

  // Action states
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch available cycles
  useEffect(() => {
    const fetchCycles = async () => {
      setLoadingCycles(true);
      try {
        const res = await api.get<FeedbackCycle[]>('/admin/feedback-cycles');
        const cyclesList = Array.isArray(res) ? res : [];
        setCycles(cyclesList);

        if (cyclesList.length > 0) {
          // Prefer active cycle, else first one
          const activeCycle = cyclesList.find((c) => c.status === 'ACTIVE') || cyclesList[0];
          setSelectedCycleId(activeCycle.id);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách chu kỳ:', err);
      } finally {
        setLoadingCycles(false);
      }
    };

    fetchCycles();
  }, []);

  // 2. Fetch students when classId or selectedCycleId changes
  const fetchStudents = async (cycleId: number, autoSelectFirst = true) => {
    if (!classId || !cycleId) return;
    setLoadingStudents(true);
    try {
      const data = await api.get<StudentFeedbackItem[]>(
        `/feedback/ta/classes/${classId}/cycles/${cycleId}/students`
      );
      const studentList = Array.isArray(data) ? data : [];
      setStudents(studentList);

      if (autoSelectFirst && studentList.length > 0) {
        // Pick first student
        const first = studentList[0];
        setSelectedStudent(first);
        // Pick first applicable skill for this student
        const firstValidSkill =
          SKILLS.find(
            (s) =>
              first.feedbackBySkill[s.key]?.status !== 'NOT_APPLICABLE' &&
              first.feedbackBySkill[s.key]?.status !== 'HOSTED_AWAY'
          )?.key || 'READING';
        setSelectedSkill(firstValidSkill);

        // Populate initial text
        const key = `${first.studentProfileId}_${firstValidSkill}`;
        const initialText = first.feedbackBySkill[firstValidSkill]?.taFeedbackHtml || '';
        setFeedbackText(initialText);
        setDrafts((prev) => ({ ...prev, [key]: initialText }));
      } else if (selectedStudent) {
        // Refresh selected student data if already selected
        const updated = studentList.find(
          (s) => s.studentProfileId === selectedStudent.studentProfileId
        );
        if (updated) {
          setSelectedStudent(updated);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách học sinh:', err);
      setErrorMsg('Không thể tải danh sách học sinh cho chu kỳ này.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (classId && selectedCycleId) {
      fetchStudents(selectedCycleId, true);
    }
  }, [classId, selectedCycleId]);

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => s.studentName.toLowerCase().includes(q));
  }, [students, searchQuery]);

  // Handle select student and skill
  const handleSelectStudentAndSkill = (student: StudentFeedbackItem, skill: SkillType) => {
    const status = student.feedbackBySkill[skill]?.status;
    if (status === 'NOT_APPLICABLE') {
      return; // Do nothing for not applicable
    }

    setSelectedStudent(student);
    setSelectedSkill(skill);
    setErrorMsg(null);
    setSuccessMsg(null);

    const draftKey = `${student.studentProfileId}_${skill}`;
    if (drafts[draftKey] !== undefined) {
      setFeedbackText(drafts[draftKey]);
    } else {
      const existingText = student.feedbackBySkill[skill]?.taFeedbackHtml || '';
      setFeedbackText(existingText);
      setDrafts((prev) => ({ ...prev, [draftKey]: existingText }));
    }
  };

  // Textarea change handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setFeedbackText(newText);
    if (selectedStudent) {
      const draftKey = `${selectedStudent.studentProfileId}_${selectedSkill}`;
      setDrafts((prev) => ({ ...prev, [draftKey]: newText }));
    }
  };

  // Save draft or submit
  const handleSave = async (submit: boolean) => {
    if (!selectedStudent || !selectedCycleId) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put<{ feedbackId: number; status: string }>(
        `/feedback/ta/students/${selectedStudent.studentProfileId}/skills/${selectedSkill}/cycles/${selectedCycleId}`,
        {
          taFeedbackHtml: feedbackText,
          submit,
        }
      );

      setSuccessMsg(
        submit
          ? 'Đã gửi nhận xét thành công cho Giáo viên!'
          : 'Đã lưu bản nháp nhận xét thành công!'
      );
      setTimeout(() => setSuccessMsg(null), 3500);

      // Re-fetch students without resetting the selection
      await fetchStudents(selectedCycleId, false);
    } catch (err: any) {
      console.error('Lỗi khi lưu nhận xét:', err);
      setErrorMsg(err.message || 'Lỗi khi lưu nhận xét. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  // Navigation: prev/next student
  const currentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return filteredStudents.findIndex(
      (s) => s.studentProfileId === selectedStudent.studentProfileId
    );
  }, [filteredStudents, selectedStudent]);

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      const prev = filteredStudents[currentIndex - 1];
      // Keep current skill if applicable, else pick first valid
      const targetSkill =
        prev.feedbackBySkill[selectedSkill]?.status !== 'NOT_APPLICABLE'
          ? selectedSkill
          : SKILLS.find((s) => prev.feedbackBySkill[s.key]?.status !== 'NOT_APPLICABLE')?.key ||
            'READING';
      handleSelectStudentAndSkill(prev, targetSkill);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < filteredStudents.length - 1 && currentIndex >= 0) {
      const next = filteredStudents[currentIndex + 1];
      const targetSkill =
        next.feedbackBySkill[selectedSkill]?.status !== 'NOT_APPLICABLE'
          ? selectedSkill
          : SKILLS.find((s) => next.feedbackBySkill[s.key]?.status !== 'NOT_APPLICABLE')?.key ||
            'READING';
      handleSelectStudentAndSkill(next, targetSkill);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const selectedSkillConfig = SKILLS.find((s) => s.key === selectedSkill) || SKILLS[0];
  const currentSkillStatus = selectedStudent?.feedbackBySkill[selectedSkill]?.status || 'NOT_STARTED';

  // Stats calculation
  const stats = useMemo(() => {
    let completed = 0;
    let waiting = 0;
    let draftsCount = 0;
    let notStarted = 0;

    students.forEach((st) => {
      SKILLS.forEach((sk) => {
        const s = st.feedbackBySkill[sk.key]?.status;
        if (s === 'COMPLETED') completed++;
        else if (s === 'WAITING_TEACHER' || s === 'TEACHER_DRAFT') waiting++;
        else if (s === 'TA_DRAFT') draftsCount++;
        else if (s === 'NOT_STARTED') notStarted++;
      });
    });

    return { completed, waiting, draftsCount, notStarted };
  }, [students]);

  return (
    <TaLayout>
      <div className="space-y-5 pb-10">
        {/* Top Header & Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={classId ? `/ta/classes/${classId}` : '/ta/classes'}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#0F5F4A] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại chi tiết lớp
              </Link>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Đánh giá học sinh (Feedback Trợ giảng)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Ghi nhận xét chi tiết từng kỹ năng định kỳ cho học sinh và gửi giáo viên phê duyệt.
            </p>
          </div>

          {/* Cycle Selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[#0F5F4A]" />
              Chu kỳ:
            </span>
            {loadingCycles ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F5F4A]" />
                Đang tải chu kỳ...
              </div>
            ) : cycles.length === 0 ? (
              <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                Chưa có chu kỳ feedback nào.
              </div>
            ) : (
              <select
                value={selectedCycleId ?? ''}
                onChange={(e) => setSelectedCycleId(Number(e.target.value))}
                className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-[#0F5F4A] transition-all"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatDate(c.startDate)} - {formatDate(c.endDate)})
                    {c.status === 'ACTIVE' ? ' [Đang mở]' : ' [Đã đóng]'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Global Alert Messages */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <div className="flex-1 font-semibold">{successMsg}</div>
          </div>
        )}

        {/* Progress & Quick Stats Bar */}
        {cycles.length > 0 && students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-xs">
            <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-gray-100 last:border-0">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
              <div>
                <span className="text-gray-500 font-medium">Chưa bắt đầu:</span>{' '}
                <strong className="text-gray-800 font-bold">{stats.notStarted}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-gray-100 last:border-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <span className="text-gray-500 font-medium">Đang nháp:</span>{' '}
                <strong className="text-amber-800 font-bold">{stats.draftsCount}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-gray-100 last:border-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div>
                <span className="text-gray-500 font-medium">Chờ GV duyệt:</span>{' '}
                <strong className="text-blue-800 font-bold">{stats.waiting}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <span className="text-gray-500 font-medium">Đã hoàn thành:</span>{' '}
                <strong className="text-emerald-700 font-bold">{stats.completed}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Main Work Area: Left Sidebar (Student List) + Right Panel (Feedback Editor) */}
        {!loadingCycles && cycles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">Chưa có chu kỳ feedback nào</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Hiện tại chưa có chu kỳ đánh giá nào được kích hoạt bởi quản trị viên.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT SIDEBAR: Student List (5 cols on lg) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              {/* Sidebar Header & Search */}
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Danh sách học sinh ({students.length})
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    Chọn học sinh & kỹ năng
                  </div>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-[#0F5F4A] transition-all"
                  />
                </div>

                {/* Skill Column Headers */}
                <div className="grid grid-cols-12 text-[11px] font-bold text-gray-500 px-3 pt-1">
                  <div className="col-span-5">Học sinh</div>
                  <div className="col-span-7 grid grid-cols-4 text-center">
                    {SKILLS.map((sk) => (
                      <span
                        key={sk.key}
                        style={{ color: sk.color }}
                        className="font-black"
                        title={sk.nameVi}
                      >
                        {sk.shortLabel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto">
                {loadingStudents ? (
                  <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F5F4A]" />
                    <span>Đang tải danh sách học sinh...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    {students.length === 0
                      ? 'Lớp học chưa có học sinh nào.'
                      : 'Không tìm thấy học sinh phù hợp.'}
                  </div>
                ) : (
                  filteredStudents.map((st) => {
                    const isStudentSelected =
                      selectedStudent?.studentProfileId === st.studentProfileId;

                    return (
                      <div
                        key={st.studentProfileId}
                        className={`px-3 py-2.5 transition-colors grid grid-cols-12 items-center gap-1 ${
                          isStudentSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50/80'
                        }`}
                      >
                        {/* Student Name & Type */}
                        <div
                          className="col-span-5 pr-1.5 cursor-pointer select-none"
                          onClick={() => {
                            // Select this student keeping the current skill
                            handleSelectStudentAndSkill(st, selectedSkill);
                          }}
                        >
                          <div className="text-xs font-bold text-gray-900 truncate" title={st.studentName}>
                            {st.studentName}
                          </div>
                          {st.type === 'CROSS' && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded">
                              (Từ lớp khác)
                            </span>
                          )}
                        </div>

                        {/* 4 Skill Columns */}
                        <div className="col-span-7 grid grid-cols-4 gap-1 text-center items-center">
                          {SKILLS.map((sk) => {
                            const info = st.feedbackBySkill[sk.key];
                            const status = info?.status || 'NOT_STARTED';
                            const isCellActive =
                              isStudentSelected && selectedSkill === sk.key;
                            const isClickable =
                              status !== 'NOT_APPLICABLE' && status !== 'HOSTED_AWAY';

                            return (
                              <button
                                key={sk.key}
                                type="button"
                                onClick={() => handleSelectStudentAndSkill(st, sk.key)}
                                disabled={!isClickable}
                                className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isCellActive
                                    ? 'ring-2 ring-[#0F5F4A] ring-offset-1 bg-white shadow-sm'
                                    : isClickable
                                    ? 'hover:bg-white hover:shadow-xs'
                                    : 'cursor-not-allowed opacity-75'
                                }`}
                              >
                                {renderStatusBadge(status)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Feedback Editor (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              {selectedStudent ? (
                <>
                  {/* Editor Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm sm:text-base font-black text-gray-900">
                          {selectedStudent.studentName}
                        </span>
                        {selectedStudent.type === 'CROSS' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Học ghép
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Skill pill */}
                        <span
                          style={{
                            color: selectedSkillConfig.color,
                            backgroundColor: selectedSkillConfig.bgColor,
                            borderColor: selectedSkillConfig.borderColor,
                          }}
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        >
                          {selectedSkillConfig.nameVi}
                        </span>

                        {/* Status pill */}
                        <span className="text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                          Trạng thái: <strong className="text-gray-800">{getStatusTitleVi(currentSkillStatus)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Prev / Next Navigation Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={handlePrevStudent}
                        disabled={currentIndex <= 0}
                        title="Chuyển đến học sinh trước"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Học sinh trước
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStudent}
                        disabled={
                          currentIndex >= filteredStudents.length - 1 || currentIndex < 0
                        }
                        title="Chuyển đến học sinh tiếp theo"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Học sinh tiếp
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Skill Switcher Tabs */}
                  <div className="flex items-center border-b border-gray-200 px-4 bg-white overflow-x-auto">
                    {SKILLS.map((sk) => {
                      const info = selectedStudent.feedbackBySkill[sk.key];
                      const status = info?.status || 'NOT_STARTED';
                      const isSelected = selectedSkill === sk.key;
                      const isNotApplicable = status === 'NOT_APPLICABLE';

                      return (
                        <button
                          key={sk.key}
                          type="button"
                          disabled={isNotApplicable}
                          onClick={() => handleSelectStudentAndSkill(selectedStudent, sk.key)}
                          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                            isSelected
                              ? 'border-[#0F5F4A] text-[#0F5F4A]'
                              : isNotApplicable
                              ? 'border-transparent text-gray-300 cursor-not-allowed'
                              : 'border-transparent text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span
                            style={{
                              color: isSelected ? sk.color : undefined,
                            }}
                          >
                            {sk.nameVi}
                          </span>
                          <span className="scale-90">{renderStatusBadge(status)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Editor Content Area */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    {/* Status contextual alerts */}
                    {currentSkillStatus === 'HOSTED_AWAY' && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>
                          Học sinh này được xếp học kỹ năng{' '}
                          <strong>{selectedSkillConfig.nameVi}</strong> tại lớp khác. TA lớp đó
                          sẽ thực hiện đánh giá.
                        </span>
                      </div>
                    )}

                    {currentSkillStatus === 'WAITING_TEACHER' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Nhận xét đã được gửi cho Giáo viên phê duyệt. Bạn vẫn có thể chỉnh sửa
                          và cập nhật lại nếu cần.
                        </span>
                      </div>
                    )}

                    {currentSkillStatus === 'COMPLETED' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Kỹ năng này đã hoàn thành đánh giá (Giáo viên đã phê duyệt và cho điểm
                          rubric).
                        </span>
                      </div>
                    )}

                    {/* Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-700">
                          Nội dung nhận xét kỹ năng {selectedSkillConfig.nameVi}:
                        </label>
                        <span className="text-[11px] text-gray-400">
                          {feedbackText.length} ký tự
                        </span>
                      </div>

                      <textarea
                        rows={14}
                        value={feedbackText}
                        onChange={handleTextChange}
                        disabled={currentSkillStatus === 'HOSTED_AWAY'}
                        placeholder={`Nhập nhận xét chi tiết của Trợ giảng về kỹ năng ${selectedSkillConfig.nameVi} cho học viên ${selectedStudent.studentName} (điểm mạnh, lỗi phát âm/ngữ pháp hay gặp, tiến độ làm bài tập, thái độ học tập, lời khuyên cải thiện)...`}
                        className="w-full text-xs sm:text-sm text-gray-800 p-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F4A] focus:border-[#0F5F4A] transition-all leading-relaxed placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {currentSkillStatus === 'TA_DRAFT' && (
                          <span className="text-amber-700 font-medium">
                            • Đang lưu dưới dạng nháp. Hãy gửi cho Giáo viên khi hoàn tất.
                          </span>
                        )}
                        {currentSkillStatus === 'NOT_STARTED' && (
                          <span className="text-gray-400">
                            • Chưa có nhận xét cho kỹ năng này.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Save Draft Button */}
                        <button
                          type="button"
                          disabled={saving || currentSkillStatus === 'HOSTED_AWAY'}
                          onClick={() => handleSave(false)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#1D7A61] text-[#0F5F4A] hover:bg-[#DDF4EA]/50 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Lưu nháp</span>
                        </button>

                        {/* Submit to Teacher Button */}
                        <button
                          type="button"
                          disabled={saving || currentSkillStatus === 'HOSTED_AWAY'}
                          onClick={() => handleSave(true)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5F4A] hover:bg-[#1D7A61] text-white font-bold text-xs shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Gửi cho Giáo viên</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-24 px-6 text-center text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">Chưa chọn học sinh</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Vui lòng chọn một học sinh và kỹ năng từ danh sách bên trái để bắt đầu nhập
                    nhận xét.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TaLayout>
  );
}
