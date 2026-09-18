import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SKILL_REGISTRY } from '../../config/skills';
import { Button } from '../../components/ui/Button';

interface StudentLessonDto {
  vocabularySetId: number;
  title: string;
  description?: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
  displayOrder: number;
}

interface ReadingAssignmentDto {
  id: number;
  title: string;
  durationMinutes: number;
  attemptCount: number;
  latestSubmittedAttemptId?: number | null;
  activeAttemptId?: number | null;
}

interface StudentClassDto {
  id: number;
  name: string;
  code: string;
  lessons: StudentLessonDto[];
  readings?: ReadingAssignmentDto[]; // New
}

export const StudentReadingPage: React.FC = () => {
  const [classesData, setClassesData] = useState<StudentClassDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentClassesData = async () => {
      try {
        const recentKey = 'student_recent_classes';
        const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
        
        if (recent.length === 0) {
          setLoading(false);
          return;
        }

        const classPromises = recent.map((c: any) => 
          api.get<StudentClassDto>(`/learn/classes/${c.slug}`).catch(() => null)
        );

        const results = await Promise.all(classPromises);
        const validClasses = results.filter(Boolean) as StudentClassDto[];
        
        // Now fetch reading assignments for each class
        for (const cls of validClasses) {
          try {
            const readings = await api.get(`/learn/class/${cls.id}/reading`);
            cls.readings = Array.isArray(readings) ? readings : [];
          } catch (e) {
            cls.readings = [];
          }
        }
        
        setClassesData(validClasses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentClassesData();
  }, []);

  const skill = SKILL_REGISTRY.READING;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      
      {/* Header */}
      <div className="flex items-start gap-6 border-b border-gray-200 pb-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 ${skill.accentClass}`}>
          {skill.label.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{skill.label}</h1>
          <p className="text-gray-500 text-lg">Học và luyện kỹ năng Reading.</p>
        </div>
      </div>

      {/* Vocabulary Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">TỪ VỰNG</h2>
          <p className="text-gray-500">Ôn từ vựng trước khi làm bài Reading.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-light border-t-brand rounded-full animate-spin"></div>
          </div>
        ) : classesData.length === 0 ? (
          <div className="bg-surface p-8 rounded-2xl border border-surface-hover text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có lớp học nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Vui lòng truy cập qua đường dẫn lớp học do giáo viên cung cấp để xem các bộ từ vựng được giao.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {classesData.map(cls => (
              <div key={cls.id} className="bg-surface rounded-2xl border border-surface-hover shadow-sm overflow-hidden">
                <div className="bg-surface-muted px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Lớp: {cls.name}</h3>
                  <Link to={`/class/${cls.code}`} className="text-sm text-green-600 font-bold hover:underline">
                    Xem lớp
                  </Link>
                </div>
                
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm tracking-wide">TỪ VỰNG ĐƯỢC GIAO</h4>
                  {cls.lessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">Chưa có bài học từ vựng.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cls.lessons.map(lesson => (
                        <div key={lesson.vocabularySetId} className="flex items-center justify-between p-4 rounded-xl border border-surface-hover hover:border-brand hover:shadow-sm transition-all">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{lesson.title}</h4>
                            <div className="text-xs text-gray-500 font-medium">
                              {lesson.wordCount} từ
                            </div>
                          </div>
                          <Link 
                            to={`/learn/vocabulary/${lesson.vocabularySetId}?classId=${cls.id}`}
                            className="px-4 py-2 bg-brand-light text-brand-text font-bold rounded-lg text-sm hover:bg-surface-hover transition-colors"
                          >
                            Ôn từ
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50/50">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm tracking-wide">BÀI TẬP READING</h4>
                  {(!cls.readings || cls.readings.length === 0) ? (
                    <p className="text-gray-500 text-center py-4 text-sm">Chưa có bài tập Reading được giao.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cls.readings.map(reading => (
                        <div key={reading.id} className="flex flex-col p-4 rounded-xl border border-surface-hover hover:border-brand hover:shadow-sm transition-all bg-white">
                          <h4 className="font-bold text-gray-900 mb-1">{reading.title}</h4>
                          <div className="text-xs text-gray-500 font-medium mb-4">
                            {reading.durationMinutes} phút • Đã làm {reading.attemptCount} lần
                          </div>
                                              <div className="w-full mt-auto pt-2">
                      {(() => {
                        const hasSubmittedAttempt = reading.attemptCount > 0 && reading.latestSubmittedAttemptId != null;
                        const hasActiveAttempt = reading.activeAttemptId != null;

                        if (hasSubmittedAttempt && !hasActiveAttempt) {
                          return (
                            <div className="flex items-center gap-2">
                              <Link to={`/learn/classes/${cls.id}/reading/${reading.id}/attempts/${reading.latestSubmittedAttemptId}/result`} className="flex-1">
                                <Button variant="outline" className="w-full">Xem kết quả</Button>
                              </Link>
                              <Link to={`/learn/classes/${cls.id}/reading/${reading.id}`} className="flex-1">
                                <Button className="w-full">Làm lại</Button>
                              </Link>
                            </div>
                          );
                        }

                        if (hasSubmittedAttempt && hasActiveAttempt) {
                          return (
                            <div className="flex items-center gap-2">
                              <Link to={`/learn/classes/${cls.id}/reading/${reading.id}/attempts/${reading.latestSubmittedAttemptId}/result`} className="flex-1">
                                <Button variant="outline" className="w-full">Xem kết quả</Button>
                              </Link>
                              <Link to={`/learn/classes/${cls.id}/reading/${reading.id}`} className="flex-1">
                                <Button className="w-full">Tiếp tục</Button>
                              </Link>
                            </div>
                          );
                        }

                        if (!hasSubmittedAttempt && hasActiveAttempt) {
                          return (
                            <Link to={`/learn/classes/${cls.id}/reading/${reading.id}`} className="w-full block">
                              <Button className="w-full">Tiếp tục</Button>
                            </Link>
                          );
                        }

                        return (
                          <Link to={`/learn/classes/${cls.id}/reading/${reading.id}`} className="w-full block">
                            <Button className="w-full">Làm bài</Button>
                          </Link>
                        );
                      })()}
                    </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
