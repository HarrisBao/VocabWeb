import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, BookOpen, Headphones, PenLine, Mic, AlertCircle, FileText } from 'lucide-react';

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

interface FeedbackScore {
  criterionId: number;
  criterionName: string;
  scoreCode: string;
  scoreValue: number;
}

interface SkillFeedback {
  id: number;
  skill: string;
  status: string;
  taFeedbackHtml: string | null;
  teacherFeedbackHtml: string | null;
  hostClassName: string | null;
  completedAt: string | null;
  scores: FeedbackScore[];
  template: FeedbackTemplate | null;
}

interface CycleFeedbackResponse {
  cycle: FeedbackCycle;
  feedbacks: SkillFeedback[];
  scoreLegend: Record<string, number>;
}

interface SkillDefinition {
  key: string;
  name: string;
  vietnameseName: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
}

const SKILLS_CONFIG: SkillDefinition[] = [
  {
    key: 'READING',
    name: 'Reading',
    vietnameseName: 'Kỹ năng Đọc',
    icon: BookOpen,
    accentColor: '#1E7A57',
    bgColor: '#DDF4EA',
  },
  {
    key: 'LISTENING',
    name: 'Listening',
    vietnameseName: 'Kỹ năng Nghe',
    icon: Headphones,
    accentColor: '#7C5CC4',
    bgColor: '#EEE7FB',
  },
  {
    key: 'WRITING',
    name: 'Writing',
    vietnameseName: 'Kỹ năng Viết',
    icon: PenLine,
    accentColor: '#3B82C4',
    bgColor: '#E6F0FB',
  },
  {
    key: 'SPEAKING',
    name: 'Speaking',
    vietnameseName: 'Kỹ năng Nói',
    icon: Mic,
    accentColor: '#C96A2E',
    bgColor: '#FBEEDC',
  },
];

const SCORE_BADGES: Record<string, string> = {
  E: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  VG: 'bg-blue-100 text-blue-800 border-blue-300',
  G: 'bg-teal-100 text-teal-800 border-teal-300',
  F: 'bg-amber-100 text-amber-800 border-amber-300',
  NI: 'bg-orange-100 text-orange-800 border-orange-300',
  P: 'bg-red-100 text-red-800 border-red-300',
};

const getScoreBadgeClass = (code?: string): string => {
  if (!code) return 'bg-gray-100 text-gray-500 border-gray-200';
  return SCORE_BADGES[code.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
};

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
          Hoàn thành
        </span>
      );
    case 'WAITING_TEACHER':
    case 'TEACHER_DRAFT':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
          Đang xử lý
        </span>
      );
    case 'TA_DRAFT':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
          Đang viết
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
          Chưa có đánh giá
        </span>
      );
  }
};

const StudentFeedbackPage: React.FC = () => {
  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [cycleData, setCycleData] = useState<CycleFeedbackResponse | null>(null);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Load list of available feedback cycles for this student
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoadingCycles(true);
        setErrorMessage(null);
        const data = await api.get<FeedbackCycle[]>('/feedback/student/cycles');
        const cycleList = Array.isArray(data) ? data : [];
        setCycles(cycleList);

        if (cycleList.length > 0) {
          setSelectedCycleId(cycleList[0].id);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chu kỳ đánh giá:', err);
        setErrorMessage('Không thể tải danh sách chu kỳ đánh giá. Vui lòng thử lại sau.');
      } finally {
        setLoadingCycles(false);
      }
    };

    fetchCycles();
  }, []);

  // 2. Load feedback details when selected cycle changes
  useEffect(() => {
    if (!selectedCycleId) {
      setCycleData(null);
      return;
    }

    const fetchCycleFeedback = async () => {
      try {
        setLoadingFeedback(true);
        setErrorMessage(null);
        const data = await api.get<CycleFeedbackResponse>(`/feedback/student/cycles/${selectedCycleId}`);
        setCycleData(data);
      } catch (err) {
        console.error('Lỗi tải bảng đánh giá chu kỳ:', err);
        setErrorMessage('Không thể tải nội dung đánh giá cho chu kỳ này.');
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchCycleFeedback();
  }, [selectedCycleId]);

  const feedbacks = cycleData?.feedbacks || [];

  // Determine criteria column count: IELTS templates have 4 criteria
  const maxCriteriaCount = Math.max(
    4,
    ...feedbacks.map((f) => f.template?.criteria?.length || f.scores?.length || 0)
  );

  const getCriterionData = (feedback: SkillFeedback, colIndex: number) => {
    // 1. Try from template criteria
    if (feedback.template?.criteria && feedback.template.criteria.length > colIndex) {
      const criterion = feedback.template.criteria[colIndex];
      const score = feedback.scores?.find((s) => s.criterionId === criterion.id);
      return {
        name: criterion.name,
        scoreCode: score?.scoreCode,
        scoreValue: score?.scoreValue,
      };
    }

    // 2. Fallback to scores array
    if (feedback.scores && feedback.scores.length > colIndex) {
      const score = feedback.scores[colIndex];
      return {
        name: score.criterionName,
        scoreCode: score.scoreCode,
        scoreValue: score.scoreValue,
      };
    }

    return null;
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return '';
    try {
      const s = new Date(start).toLocaleDateString('vi-VN');
      const e = new Date(end).toLocaleDateString('vi-VN');
      return `${s} - ${e}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Báo cáo Đánh giá Định kỳ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bảng điểm và nhận xét chi tiết 4 kỹ năng theo từng tháng / chu kỳ học tập
          </p>
        </div>

        {/* Cycle Selector Dropdown */}
        {!loadingCycles && cycles.length > 0 && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <label htmlFor="feedback-cycle-select" className="text-xs font-bold text-gray-600 whitespace-nowrap">
              Chu kỳ đánh giá:
            </label>
            <select
              id="feedback-cycle-select"
              value={selectedCycleId ?? ''}
              onChange={(e) => setSelectedCycleId(Number(e.target.value))}
              className="bg-white border border-gray-300 hover:border-[#0F5F4A] focus:border-[#0F5F4A] focus:ring-1 focus:ring-[#0F5F4A] rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 shadow-xs outline-none transition-colors cursor-pointer"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatDateRange(c.startDate, c.endDate)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Fixed Score Legend Row */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-xs">
          <div className="font-bold text-gray-700 flex items-center gap-2 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F5F4A]"></span>
            Thang điểm đánh giá:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50/70 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                E
              </span>
              <span className="text-gray-700 font-medium">Excellent (6)</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 bg-blue-50/70 px-2.5 py-1 rounded-md border border-blue-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                VG
              </span>
              <span className="text-gray-700 font-medium">Very Good (5)</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 bg-teal-50/70 px-2.5 py-1 rounded-md border border-teal-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                G
              </span>
              <span className="text-gray-700 font-medium">Good (4)</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 bg-amber-50/70 px-2.5 py-1 rounded-md border border-amber-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                F
              </span>
              <span className="text-gray-700 font-medium">Fair (3)</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 bg-orange-50/70 px-2.5 py-1 rounded-md border border-orange-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">
                NI
              </span>
              <span className="text-gray-700 font-medium">Needs Improvement (2)</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 bg-red-50/70 px-2.5 py-1 rounded-md border border-red-200">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                P
              </span>
              <span className="text-gray-700 font-medium">Poor (1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading States & Content */}
      {loadingCycles ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-gray-500 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F5F4A] mb-3" />
          <p className="text-sm font-medium">Đang tải danh sách chu kỳ đánh giá...</p>
        </div>
      ) : cycles.length === 0 ? (
        /* Empty cycles state */
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có đánh giá nào.</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Hiện tại chưa có đợt đánh giá định kỳ nào được ghi nhận cho bạn. Khi giáo viên hoặc trợ giảng hoàn thành đánh giá, thông tin sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : loadingFeedback ? (
        /* Feedback loading state */
        <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-gray-500 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F5F4A] mb-3" />
          <p className="text-sm font-medium">Đang tải bảng đánh giá chi tiết...</p>
        </div>
      ) : (
        /* Main Excel-style Table */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 border-r border-gray-200 w-44">
                    Kỹ năng
                  </th>
                  <th className="py-3.5 px-3 border-r border-gray-200 w-36 text-center">
                    Lớp học
                  </th>
                  {Array.from({ length: maxCriteriaCount }, (_, i) => (
                    <th
                      key={i}
                      className="py-3.5 px-3 border-r border-gray-200 w-36 text-center"
                    >
                      Tiêu chí {i + 1}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 border-r border-gray-200 w-72">
                    Nhận xét của Trợ giảng
                  </th>
                  <th className="py-3.5 px-4 border-r border-gray-200 w-72">
                    Nhận xét của Giáo viên
                  </th>
                  <th className="py-3.5 px-3 w-32 text-center">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {SKILLS_CONFIG.map((skill) => {
                  const feedback = feedbacks.find(
                    (f) => f.skill.toUpperCase() === skill.key
                  );
                  const SkillIcon = skill.icon;

                  if (!feedback) {
                    // Skill has no feedback in this cycle: show empty/gray row with 'Chưa có đánh giá'
                    return (
                      <tr key={skill.key} className="bg-gray-50/40 hover:bg-gray-50/70 transition-colors">
                        {/* Column 1: Skill */}
                        <td className="py-4 px-4 border-r border-gray-200 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                              style={{ backgroundColor: skill.bgColor, color: skill.accentColor }}
                            >
                              <SkillIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-700 leading-tight">
                                {skill.name}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {skill.vietnameseName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Remaining columns: Empty state */}
                        <td
                          colSpan={maxCriteriaCount + 4}
                          className="py-6 px-4 text-center text-xs text-gray-400 italic bg-gray-50/30 border-r border-gray-200"
                        >
                          Chưa có đánh giá
                        </td>
                      </tr>
                    );
                  }

                  // Skill has feedback
                  return (
                    <tr key={skill.key} className="hover:bg-gray-50/60 transition-colors">
                      {/* Column 1: Skill name with icon/color */}
                      <td className="py-4 px-4 border-r border-gray-200 align-top">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                            style={{ backgroundColor: skill.bgColor, color: skill.accentColor }}
                          >
                            <SkillIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">
                              {skill.name}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {skill.vietnameseName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Host class badge */}
                      <td className="py-4 px-3 border-r border-gray-200 align-top text-center">
                        {feedback.hostClassName ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 leading-normal">
                            Học tại {feedback.hostClassName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Lớp chính</span>
                        )}
                      </td>

                      {/* Columns 3+: One column per criterion */}
                      {Array.from({ length: maxCriteriaCount }, (_, colIndex) => {
                        const criterionData = getCriterionData(feedback, colIndex);

                        return (
                          <td
                            key={colIndex}
                            className="py-4 px-2 border-r border-gray-200 align-top text-center"
                          >
                            {criterionData ? (
                              <div className="flex flex-col items-center justify-start gap-1.5 h-full">
                                <span
                                  className="text-[11px] font-medium text-gray-600 line-clamp-2 max-w-[130px] leading-tight"
                                  title={criterionData.name}
                                >
                                  {criterionData.name}
                                </span>
                                {criterionData.scoreCode ? (
                                  <span
                                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-black border shadow-xs ${getScoreBadgeClass(
                                      criterionData.scoreCode
                                    )}`}
                                    title={
                                      criterionData.scoreValue
                                        ? `Điểm quy đổi: ${criterionData.scoreValue}`
                                        : undefined
                                    }
                                  >
                                    {criterionData.scoreCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-300 font-mono">-</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 font-mono">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Column N: TA comment (rendered as HTML safely) */}
                      <td className="py-4 px-4 border-r border-gray-200 align-top">
                        {feedback.taFeedbackHtml ? (
                          <div
                            className="text-xs text-gray-800 leading-relaxed max-h-52 overflow-y-auto space-y-1.5 pr-1 [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                            dangerouslySetInnerHTML={{ __html: feedback.taFeedbackHtml }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có nhận xét</span>
                        )}
                      </td>

                      {/* Column N+1: Teacher comment (rendered as HTML safely) */}
                      <td className="py-4 px-4 border-r border-gray-200 align-top">
                        {feedback.teacherFeedbackHtml ? (
                          <div
                            className="text-xs text-gray-800 leading-relaxed max-h-52 overflow-y-auto space-y-1.5 pr-1 [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                            dangerouslySetInnerHTML={{ __html: feedback.teacherFeedbackHtml }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có nhận xét</span>
                        )}
                      </td>

                      {/* Column N+2: Status badge */}
                      <td className="py-4 px-3 align-top text-center">
                        {renderStatusBadge(feedback.status)}
                        {feedback.completedAt && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(feedback.completedAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { StudentFeedbackPage };
export default StudentFeedbackPage;
