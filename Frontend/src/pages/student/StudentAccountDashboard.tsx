import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, Users, BookOpen, Headphones, Edit3, MessageCircle, ChevronRight, Sparkles, Clock, CheckCircle2, Award, MessageSquare } from 'lucide-react';
import { StudentProgressWidget } from '../../components/progress/StudentProgressWidget';

interface EnrolledClass {
  id: number;
  name: string;
  code: string;
  description: string;
  joinedAt: string;
}

interface VocabularyUnit {
  id: number;
  title: string;
  wordCount: number;
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
  hostClassName?: string;
}

interface DashboardData {
  classes: EnrolledClass[];
  pendingReadings: (ReadingAssignment & { classId: number, className: string })[];
  vocabUnits: (VocabularyUnit & { classId: number, className: string })[];
  skillContexts: Record<number, SkillContext[]>;
  hasFeedback: boolean;
}

const SKILL_PILLS = [
  { id: 'READING', label: 'Đọc hiểu', bg: 'bg-[#DDF4EA]', text: 'text-[#1E7A57]' },
  { id: 'LISTENING', label: 'Nghe', bg: 'bg-[#EEE7FB]', text: 'text-[#7C5CC4]' },
  { id: 'WRITING', label: 'Viết', bg: 'bg-[#E6F0FB]', text: 'text-[#3B82C4]' },
  { id: 'SPEAKING', label: 'Nói', bg: 'bg-[#FBEEDC]', text: 'text-[#C96A2E]' }
];

export const StudentAccountDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    classes: [],
    pendingReadings: [],
    vocabUnits: [],
    skillContexts: {},
    hasFeedback: false
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const stored = localStorage.getItem('student_profile');
  let profileName = 'bạn';
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Get first name for a friendlier greeting
      const parts = parsed.fullName?.split(' ') || [];
      profileName = parts.length > 0 ? parts[parts.length - 1] : 'bạn';
    } catch {}
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clsData, feedbackCycles] = await Promise.all([
          api.get<EnrolledClass[]>('/student/classes'),
          api.get<any[]>('/feedback/student/cycles').catch(() => [])
        ]);
        
        const allPendingReadings: any[] = [];
        const allVocabUnits: any[] = [];
        const contexts: Record<number, SkillContext[]> = {};
        
        await Promise.all(clsData.map(async (cls) => {
          try {
            const [readings, vocabs, ctx] = await Promise.all([
              api.get<ReadingAssignment[]>(`/student/classes/${cls.id}/reading`).catch(() => []),
              api.get<VocabularyUnit[]>(`/student/classes/${cls.id}/vocabulary`).catch(() => []),
              api.get<SkillContext[]>(`/student/classes/${cls.id}/skill-context`).catch(() => [])
            ]);
            
            contexts[cls.id] = ctx || [];
            
            if (Array.isArray(readings)) {
              const pending = readings
                .filter(r => r.activeAttemptId != null || r.attemptCount === 0)
                .map(r => ({ ...r, classId: cls.id, className: cls.name }));
              allPendingReadings.push(...pending);
            }
            
            if (Array.isArray(vocabs)) {
              const v = vocabs.map(vu => ({ ...vu, classId: cls.id, className: cls.name }));
              allVocabUnits.push(...v);
            }
          } catch (e) {
            console.error("Lỗi khi tải dữ liệu phụ trợ cho lớp", cls.id, e);
          }
        }));
        
        setData({
          classes: clsData,
          pendingReadings: allPendingReadings.sort((a, b) => (b.activeAttemptId ? 1 : 0) - (a.activeAttemptId ? 1 : 0)).slice(0, 4),
          vocabUnits: allVocabUnits.slice(0, 4),
          skillContexts: contexts,
          hasFeedback: Array.isArray(feedbackCycles) && feedbackCycles.length > 0
        });
      } catch (e) {
        console.error("Lỗi tải danh sách lớp", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const primaryClassId = data.classes.length > 0 ? data.classes[0].id : null;

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 pt-4 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none text-emerald-600">
          <Sparkles className="w-40 h-40" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full text-xs font-bold text-emerald-700 mb-4 backdrop-blur-sm">
            <Award className="w-4 h-4" />
            Không gian học tập cá nhân
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-emerald-950 mb-4 tracking-tight">
            Xin chào, {profileName} 👋
          </h1>
          <p className="text-emerald-800/80 font-medium text-lg">
            Hôm nay mình tiếp tục hành trình học nhé. Các lớp học và bài tập của bạn đã sẵn sàng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Classes & Progress */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* My Classes */}
          <section>
            <div className="flex items-center gap-2 mb-6 px-1">
              <Users className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-black text-gray-900">Lớp học của tôi</h2>
            </div>
            
            {data.classes.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa tham gia lớp học nào</h3>
                <p className="text-gray-500">Khi giáo viên thêm bạn vào lớp, không gian học sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${data.classes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {data.classes.map(cls => {
                  const ctx = data.skillContexts[cls.id] || [];
                  const pendingCount = data.pendingReadings.filter(r => r.classId === cls.id).length;
                  
                  return (
                    <Link 
                      key={cls.id}
                      to={`/student/classes/${cls.id}`}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl group flex flex-col h-full relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />
                      
                      <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                            {cls.code.substring(0, 2)}
                          </div>
                          <div>
                            <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">Mã lớp • {cls.code}</span>
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">
                              {cls.name}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {SKILL_PILLS.map(s => {
                            const hosted = ctx.find(c => c.skill === s.id && c.isHosted);
                            return (
                              <div key={s.id} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text} flex items-center gap-1`}>
                                {s.label}
                                {hosted && <span className="opacity-75 font-semibold">({hosted.hostClassName})</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="relative z-10 mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        {pendingCount > 0 ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {pendingCount} hoạt động
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            Đã tham gia
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          Vào không gian
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Feedback */}
          {data.hasFeedback && (
            <section>
              <h2 className="text-lg font-black text-gray-900 mb-4 px-1">Kết quả & Phản hồi</h2>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col gap-3 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-[15px] mb-1">Phản hồi định kỳ</h4>
                    <p className="text-sm text-emerald-800/80 font-medium leading-tight">Giáo viên đã cập nhật nhận xét và đánh giá mới nhất cho bạn.</p>
                  </div>
                </div>
                <Link 
                  to="/student/feedback"
                  className="w-full text-center py-2.5 mt-2 rounded-xl text-sm font-bold transition-colors bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Xem chi tiết
                </Link>
              </div>
            </section>
          )}

          {/* Progress Section */}
          {primaryClassId && (
            <section>
              <div className="flex items-center gap-2 mb-6 px-1">
                <h2 className="text-2xl font-black text-gray-900">Lộ trình hiện tại</h2>
              </div>
              <StudentProgressWidget classId={primaryClassId.toString()} />
            </section>
          )}

        </div>

        {/* Right Column: Actions & Vocabulary */}
        <div className="space-y-8">
          
          {/* Học tiếp (Pending Actions) */}
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-4 px-1">Học tiếp</h2>
            {data.pendingReadings.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Tuyệt vời! Bạn không có bài tập nào đang làm dở.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingReadings.map(r => (
                  <div key={`${r.classId}-${r.id}`} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-emerald-200 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{r.className}</span>
                        {r.activeAttemptId && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Đang làm dở</span>}
                      </div>
                      <h4 className="font-bold text-gray-900 text-[15px] leading-tight">{r.title}</h4>
                    </div>
                    <Link 
                      to={`/student/classes/${r.classId}/reading/${r.id}`}
                      className={`w-full text-center py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        r.activeAttemptId 
                          ? 'bg-amber-500 text-white hover:bg-amber-600' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {r.activeAttemptId ? 'Tiếp tục làm bài' : 'Làm bài ngay'}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Vocabulary Review */}
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-4 px-1">Từ cần ôn</h2>
            {data.vocabUnits.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center shadow-sm">
                <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Hôm nay chưa có từ nào cần ôn.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.vocabUnits.map(v => (
                  <div key={`${v.classId}-${v.id}`} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px] mb-1">{v.title}</h4>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="px-1.5 py-0.5 bg-gray-50 rounded-md text-gray-600 border border-gray-100">{v.className}</span>
                        <span>•</span>
                        <span>{v.wordCount} từ</span>
                      </div>
                    </div>
                    <Link 
                      to={`/learn/vocabulary/${v.id}?classId=${v.classId}`}
                      className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};
