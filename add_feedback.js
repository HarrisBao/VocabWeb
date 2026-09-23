const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', 'utf8');

// 1. Add MessageSquare to imports
content = content.replace("Award } from 'lucide-react';", "Award, MessageSquare } from 'lucide-react';");

// 2. Add hasFeedback to DashboardData
content = content.replace("skillContexts: Record<number, SkillContext[]>;\n}", "skillContexts: Record<number, SkillContext[]>;\n  hasFeedback: boolean;\n}");

// 3. Initialize hasFeedback to false
content = content.replace("skillContexts: {}\n  });", "skillContexts: {},\n    hasFeedback: false\n  });");

// 4. Update the fetch block
const oldFetchBlock = `        const clsData = await api.get<EnrolledClass[]>('/student/classes');
        
        const allPendingReadings: any[] = [];`;
const newFetchBlock = `        const [clsData, feedbackCycles] = await Promise.all([
          api.get<EnrolledClass[]>('/student/classes'),
          api.get<any[]>('/feedback/student/cycles').catch(() => [])
        ]);
        
        const allPendingReadings: any[] = [];`;
content = content.replace(oldFetchBlock, newFetchBlock);

// 5. Update setData
const oldSetData = `        setData({
          classes: clsData,
          pendingReadings: allPendingReadings.sort((a, b) => (b.activeAttemptId ? 1 : 0) - (a.activeAttemptId ? 1 : 0)).slice(0, 4), // Priority to active attempts
          vocabUnits: allVocabUnits.slice(0, 4),
          skillContexts: contexts
        });`;
const newSetData = `        setData({
          classes: clsData,
          pendingReadings: allPendingReadings.sort((a, b) => (b.activeAttemptId ? 1 : 0) - (a.activeAttemptId ? 1 : 0)).slice(0, 4),
          vocabUnits: allVocabUnits.slice(0, 4),
          skillContexts: contexts,
          hasFeedback: Array.isArray(feedbackCycles) && feedbackCycles.length > 0
        });`;
content = content.replace(oldSetData, newSetData);

// 6. Add the Feedback section below Vocabulary
const vocabEnd = `            )}
          </section>`;
const feedbackSection = `            )}
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
          )}`;
content = content.replace(vocabEnd, feedbackSection);

fs.writeFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', content);
console.log('Added feedback section');
