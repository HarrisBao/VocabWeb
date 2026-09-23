const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', 'utf8');

const target = `export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  const { id } = useParams<{ id: string }>();
  const { id } = useParams<{ id: string }>(); 
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {`;

const fallback = `export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  const { id } = useParams<{ id: string }>();
  const { id } = useParams<{ id: string }>(); 
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Cha cA3 nTi dung h?c trong k1 nng nAy.",
  vocabUnits = [] 
}) => {`;

const rep = `export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  const { id } = useParams<{ id: string }>();`;

let replaced = false;
if (content.includes(target)) {
    content = content.replace(target, rep);
    replaced = true;
} else if (content.includes(fallback)) {
    content = content.replace(fallback, rep);
    replaced = true;
} else {
    // regex
    content = content.replace(/export const StudentEmptySkillHome.*?=>\s*\{/s, rep);
    replaced = true;
}

if (replaced) {
    fs.writeFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', content);
    console.log('Fixed syntax error');
}
