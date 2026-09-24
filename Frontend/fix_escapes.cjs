const fs = require('fs');
const files = [
  'src/components/layout/AdminLayout.tsx',
  'src/pages/admin/AdminDashboardPage.tsx',
  'src/pages/admin/AdminClassDetailPage.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace all occurrences of \` with just `
  // We need to match the literal backslash followed by backtick.
  content = content.replace(/\\`/g, '`');
  // Wait, also check if \$ was escaped as \\$
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
