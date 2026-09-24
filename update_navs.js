const fs = require('fs');

function updateSidebar() {
    let content = fs.readFileSync('Frontend/src/pages/student/components/StudentSidebar.tsx', 'utf8');
    content = content.replace("label: 'Reading'", "label: 'Đọc hiểu'");
    content = content.replace("label: 'Listening'", "label: 'Nghe'");
    content = content.replace("label: 'Writing'", "label: 'Viết'");
    content = content.replace("label: 'Speaking'", "label: 'Nói'");
    fs.writeFileSync('Frontend/src/pages/student/components/StudentSidebar.tsx', content);
}

function updateBottomNav() {
    let content = fs.readFileSync('Frontend/src/pages/student/components/StudentBottomNav.tsx', 'utf8');
    content = content.replace("label: 'Reading'", "label: 'Đọc hiểu'");
    content = content.replace("label: 'Listening'", "label: 'Nghe'");
    content = content.replace("label: 'Writing'", "label: 'Viết'");
    content = content.replace("label: 'Speaking'", "label: 'Nói'");
    fs.writeFileSync('Frontend/src/pages/student/components/StudentBottomNav.tsx', content);
}

updateSidebar();
updateBottomNav();
console.log('Navs updated');
