const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

// Add import
content = content.replace("import { StudentEmptySkillHome } from './components/StudentEmptySkillHome';", `import { StudentEmptySkillHome } from './components/StudentEmptySkillHome';
import { StudentBottomNav } from './components/StudentBottomNav';
`);

// Add bottom nav before the closing div
content = content.replace("    </div>\r\n  );\r\n};", `    </div>
    <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
  );
};`);

content = content.replace("    </div>\n  );\n};", `    </div>
    <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
  );
};`);

fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
console.log('Replaced');
