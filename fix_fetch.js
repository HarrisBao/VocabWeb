const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

const oldFetch = `    useEffect(() => {
      const fetchClass = async () => {
        try {
          const [clsData, schedData, contextData] = await Promise.all([
            api.get<ClassDetail>(\`/student/classes/\${id}\`),
            api.get<ScheduleItem[]>(\`/student/classes/\${id}/schedule\`).catch(() => []),
            api.get<SkillContext[]>(\`/student/classes/\${id}/skill-context\`).catch(() => [])
          ]);
          setCls(clsData);
          setSchedule(schedData);
          setSkillContexts(contextData);
        } catch (e) {
          console.error("Lỗi tải lớp học", e);
        } finally {
          setLoading(false);
        }
      };
      fetchClass();
    }, [id]);

    useEffect(() => {
      if (activeTab === 'vocabulary' && vocabUnits.length === 0 && !vocabError) {
        setLoadingVocab(true);
        api.get<VocabularyUnit[]>(\`/student/classes/\${id}/vocabulary\`)
          .then(data => setVocabUnits(data))
          .catch(e => {
            console.error("Lỗi tải từ vựng", e);
            setVocabError(true);
          })
          .finally(() => setLoadingVocab(false));
      }
    }, [activeTab, id, vocabUnits.length, vocabError]);

    useEffect(() => {
      if (activeTab === 'reading' && readings.length === 0 && !readingError) {
        setLoadingReading(true);
        api.get<ReadingAssignment[]>(\`/student/classes/\${id}/reading\`)
          .then(data => setReadings(Array.isArray(data) ? data : []))
          .catch(e => {
            console.error("Lỗi tải reading", e);
            setReadingError(true);
          })
          .finally(() => setLoadingReading(false));
      }
    }, [activeTab, id, readings.length, readingError]);`;

// But wait, the file has Windows line endings (\r\n) or Vietnamese characters that might get mangled. 
// Instead of string replacement of large blocks, let's use regex or a more robust parsing.
