const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', 'utf8');

content = content.replace(/export const StudentEmptySkillHome.*?{/, `export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  const { id } = useParams<{ id: string }>();`);

fs.writeFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', content);
console.log('Fixed syntax error');
