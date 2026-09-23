const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', 'utf8');

const effectTarget = `  useEffect(() => {
    // We fetch vocabulary for the class. The backend already handles Host Skill resolution.
    // So /student/classes/:id/vocabulary returns what is relevant for the student in this context.
    api.get<VocabularyUnit[]>(\`/student/classes/\${id}/vocabulary\`)
      .then(data => setVocabUnits(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);`;

const effectRep = `  useEffect(() => {
    const fetchVocab = async () => {
      try {
        setLoading(true);
        // 1. Resolve effective host class for this skill
        const contexts = await api.get<any[]>(\`/student/classes/\${id}/skill-context\`).catch(() => []);
        const skillUpper = (skill || '').toUpperCase().replace('-VOCABULARY', '');
        const ctx = contexts.find(c => c.skill === skillUpper);
        const targetClassId = ctx?.hostClassId || id;
        
        // 2. Fetch vocabulary from the host class
        const data = await api.get<VocabularyUnit[]>(\`/student/classes/\${targetClassId}/vocabulary\`);
        setVocabUnits(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, [id, skill]);`;

content = content.replace(effectTarget, effectRep);
content = content.replace('?', '•');

fs.writeFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', content);
console.log('Replaced successfully');
