with open('Frontend/src/services/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = '''  public clearTokens() {
    localStorage.removeItem('teacher_access_token')
    localStorage.removeItem('teacher_refresh_token')
    localStorage.removeItem('teacher_user_profile')
    localStorage.removeItem('student_access_token')
    localStorage.removeItem('student_profile')
    // Remove other potential cached entries
    localStorage.removeItem('recentClassSlug')
  }'''

import re
text = re.sub(r'  public clearTokens\(\) \{\s*localStorage\.removeItem\(\'teacher_access_token\'\)\s*localStorage\.removeItem\(\'teacher_refresh_token\'\)\s*localStorage\.removeItem\(\'teacher_user_profile\'\)\s*\}', replacement, text)

with open('Frontend/src/services/api.ts', 'w', encoding='utf-8') as f:
    f.write(text)