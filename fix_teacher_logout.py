with open('Frontend/src/components/layout/TeacherLayout.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("navigate('/teacher/login')", "navigate('/')")

with open('Frontend/src/components/layout/TeacherLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(text)