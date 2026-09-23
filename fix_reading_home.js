const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', 'utf8');

const target = `      {/* TỪ VỰNG CỦA BÀI */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 px-2">Từ vựng cần ôn</h2>
        {vocabUnits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500 font-medium">Hiện chưa có bộ từ vựng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabUnits.map(unit => (
              <div key={unit.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#1D7A61]/30 hover:shadow-md transition-all">
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1">{unit.title}</h3>
                  <span className="text-sm text-gray-500 font-medium">{unit.wordCount} từ vựng</span>
                </div>
                <Link 
                  to={\`/learn/vocabulary/\${unit.id}?classId=\${classId}\`}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center group-hover:bg-[#DDF4EA] group-hover:text-[#1D7A61] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>`;

const replacement = `      {/* VOCABULARY OVERVIEW CARD */}
      <section className="space-y-4">
        <BilingualText 
          primary={vocabularyLabels.vocabulary.en}
          secondary={vocabularyLabels.vocabulary.vi}
          primaryClass="text-lg font-black text-gray-900 px-2"
          secondaryClass="text-sm font-medium text-gray-500 px-2 -mt-1 block"
        />
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#1D7A61]/30 hover:shadow-md transition-all">
          <div>
            <BilingualText 
              primary={vocabularyLabels.vocabularyForReading.en}
              secondary={vocabularyLabels.vocabularyForReading.vi}
              primaryClass="font-bold text-gray-900 text-lg"
              secondaryClass="text-gray-500 font-medium text-sm block mt-0.5"
            />
            <div className="flex items-center gap-3 mt-3 text-sm font-bold text-emerald-700 bg-emerald-50 w-fit px-3 py-1 rounded-xl">
              <span>{vocabUnits.length} {vocabularyLabels.vocabularySets.en}</span>
            </div>
          </div>
          
          <Link 
            to={\`/student/classes/\${classId}/reading-vocabulary\`}
            className="w-full md:w-auto px-6 py-3 bg-gray-50 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-emerald-100"
          >
            <BilingualText 
              primary={vocabularyLabels.viewVocabulary.en}
              secondary={vocabularyLabels.viewVocabulary.vi}
              primaryClass=""
              secondaryClass="font-normal opacity-80 ml-1"
              containerClass="flex items-baseline"
            />
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    content = "import { BilingualText } from '../../../components/ui/BilingualText';\nimport { vocabularyLabels } from '../../../i18n/labels';\n" + content;
    fs.writeFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', content);
    console.log('Replaced successfully');
} else {
    console.log('Target not found');
}
