const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

content = content.replace(`  return (
    <div className="max-w-[1400px]`, `  return (
    <>
    <div className="max-w-[1400px]`);

content = content.replace(`    </div>
    <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
  );
};`, `    </div>
    <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};`);

fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
console.log('Fixed fragments');
