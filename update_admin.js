const fs = require('fs');

function updateAdminDashboard() {
    let content = fs.readFileSync('Frontend/src/pages/admin/AdminDashboardPage.tsx', 'utf8');
    content = content.replace("READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking'", "READING: 'Đọc hiểu', LISTENING: 'Nghe', WRITING: 'Viết', SPEAKING: 'Nói'");
    fs.writeFileSync('Frontend/src/pages/admin/AdminDashboardPage.tsx', content);
}

function updateAdminClassDetail() {
    let content = fs.readFileSync('Frontend/src/pages/admin/AdminClassDetailPage.tsx', 'utf8');
    content = content.replace("READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking'", "READING: 'Đọc hiểu', LISTENING: 'Nghe', WRITING: 'Viết', SPEAKING: 'Nói'");
    fs.writeFileSync('Frontend/src/pages/admin/AdminClassDetailPage.tsx', content);
}

updateAdminDashboard();
updateAdminClassDetail();
console.log('Admin pages updated');
