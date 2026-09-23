const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

// Also add the imports
content = content.replace("import { StudentProgressWidget } from '../../components/progress/StudentProgressWidget';", `
import { StudentSidebar } from './components/StudentSidebar';
import { StudentLearningHome } from './components/StudentLearningHome';
import { StudentReadingHome } from './components/StudentReadingHome';
import { StudentEmptySkillHome } from './components/StudentEmptySkillHome';
`);


const searchString = '  return (\r\n    <div className="max-w-5xl mx-auto space-y-6 pb-16">';
const returnIndex = content.indexOf(searchString);

if(returnIndex === -1) {
  // try linux line endings
  const searchString2 = '  return (\n    <div className="max-w-5xl mx-auto space-y-6 pb-16">';
  const returnIndex2 = content.indexOf(searchString2);
  if (returnIndex2 === -1) {
    console.log('not found');
    process.exit(1);
  }
  
  const top = content.substring(0, returnIndex2);
  const bottom = `  return (
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
  );
};
`;
  fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', top + bottom);
} else {
  const top = content.substring(0, returnIndex);
  const bottom = `  return (
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
  );
};
`;
  fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', top + bottom);
}
console.log('Replaced');
