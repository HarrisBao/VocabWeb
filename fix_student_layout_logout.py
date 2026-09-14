import re

with open('Frontend/src/components/layout/StudentLayout.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add api import
text = text.replace("import { SKILLS_LIST } from '../../config/skills';", "import { SKILLS_LIST } from '../../config/skills';\nimport { api } from '../../services/api';")

# Add a check for token and redirect if missing
check_auth = '''
  useEffect(() => {
    const token = localStorage.getItem('student_access_token');
    if (!token) {
      if (classSlug) {
        window.location.href = \/class/\/portal/login\;
      } else {
        window.location.href = '/student/login';
      }
    }
  }, [classSlug]);
'''
text = text.replace('  const [profileName, setProfileName] = useState<string>(\'HV\');', '  const [profileName, setProfileName] = useState<string>(\'HV\');\n' + check_auth)

# Add drop-down menu or buttons for logout
user_actions_old = '''          <div className="flex items-center gap-4">
            {classSlug && (
              <button
                onClick={() => {
                  localStorage.removeItem('student_access_token');
                  localStorage.removeItem('student_profile');
                  window.location.href = /class//portal;
                }}
                className="text-sm font-bold text-gray-500 hover:text-gray-900"
              >
                ? i h?c sinh
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-brand-light text-brand-text flex items-center justify-center font-bold text-sm">
              {profileName}
            </div>
          </div>'''

user_actions_new = '''          <div className="flex items-center gap-4">
            {classSlug ? (
              <>
                <button
                  onClick={() => {
                    api.clearTokens();
                    window.location.href = /class//portal/login;
                  }}
                  className="text-sm font-bold text-gray-500 hover:text-gray-900"
                >
                  Đổi học sinh
                </button>
                <button
                  onClick={() => {
                    api.clearTokens();
                    window.location.href = /;
                  }}
                  className="text-sm font-bold text-red-500 hover:text-red-700"
                >
                  Thoát
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  api.clearTokens();
                  window.location.href = /;
                }}
                className="text-sm font-bold text-red-500 hover:text-red-700"
              >
                Đăng xuất
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-brand-light text-brand-text flex items-center justify-center font-bold text-sm">
              {profileName}
            </div>
          </div>'''

text = re.sub(r'          <div className="flex items-center gap-4">.*?</div>\n          </div>', user_actions_new, text, flags=re.DOTALL)

with open('Frontend/src/components/layout/StudentLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(text)