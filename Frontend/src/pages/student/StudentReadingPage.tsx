import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SKILL_REGISTRY } from '../../config/skills';

interface StudentLessonDto {
  vocabularySetId: number;
  title: string;
  description?: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
  displayOrder: number;
}

interface StudentClassDto {
  id: number;
  name: string;
  code: string;
  lessons: StudentLessonDto[];
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
        setClassesData(results.filter(Boolean) as StudentClassDto[]);
      } catch (e) {
        // Handle error
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
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : classesData.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài từ vựng nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Vui lòng truy cập qua đường dẫn lớp học do giáo viên cung cấp để xem các bộ từ vựng được giao.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {classesData.map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Lớp: {cls.name}</h3>
                  <Link to={`/class/${cls.code}`} className="text-sm text-green-600 font-bold hover:underline">
                    Xem lớp
                  </Link>
                </div>
                
                <div className="p-6">
                  {cls.lessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Chưa có bài học từ vựng.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cls.lessons.map(lesson => (
                        <div key={lesson.vocabularySetId} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{lesson.title}</h4>
                            <div className="text-xs text-gray-500 font-medium">
                              {lesson.wordCount} từ
                            </div>
                          </div>
                          <Link 
                            to={`/learn/vocabulary/${lesson.vocabularySetId}?classId=${cls.id}`}
                            className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg text-sm hover:bg-green-100 transition-colors"
                          >
                            Ôn từ
                          </Link>
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

      {/* Future Reading Exercises */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">BÀI TẬP READING</h2>
          <p className="text-gray-500">Các bài tập đọc hiểu (Coming Soon).</p>
        </div>
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 border-dashed text-center">
          <p className="text-gray-500 font-medium">Chưa có bài tập Reading được giao.</p>
        </div>
      </section>
    </div>
  );
};
