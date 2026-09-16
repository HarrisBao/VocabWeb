using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;

namespace VocabWeb.Api.Controllers
{
    public partial class ClassController
    {
        [HttpGet("{id}/classroom-activity-sources")]
        public async Task<IActionResult> GetClassroomActivitySources(int id)
        {
            if (!await HasAccessToClass(id)) return Forbid();

            var lessons = await _db.ClassLessons
                .Where(l => l.ClassId == id)
                .Select(l => new { id = "lesson_" + l.Id, title = l.VocabularySet.Title, type = "unit", wordCount = l.VocabularySet.Items.Count })
                .ToListAsync();

            var reviewSets = await _db.ClassVocabularyReviewSets
                .Where(r => r.ClassId == id)
                .Select(r => new { 
                    id = "review_" + r.Id, 
                    title = r.Title, 
                    type = "review", 
                    wordCount = _db.ClassVocabularyReviewSetUnits
                        .Where(u => u.ReviewSetId == r.Id)
                        .SelectMany(u => u.ClassLesson.VocabularySet.Items)
                        .Select(i => i.Id)
                        .Distinct()
                        .Count()
                })
                .ToListAsync();

            var combined = lessons.Concat(reviewSets).OrderBy(x => x.title).ToList();
            return Ok(combined);
        }

        [HttpGet("{id}/classroom-activity-words")]
        public async Task<IActionResult> GetClassroomActivityWords(int id, [FromQuery] string sourceId)
        {
            if (!await HasAccessToClass(id)) return Forbid();

            if (string.IsNullOrEmpty(sourceId)) return BadRequest();

            if (sourceId.StartsWith("lesson_"))
            {
                int lessonId = int.Parse(sourceId.Substring(7));
                var items = await _db.ClassLessons
                    .Where(l => l.Id == lessonId && l.ClassId == id)
                    .SelectMany(l => l.VocabularySet.Items)
                    .Select(i => new { id = i.Id, word = i.Word, meaning = i.Meaning })
                    .ToListAsync();
                return Ok(items);
            }
            else if (sourceId.StartsWith("review_"))
            {
                int reviewId = int.Parse(sourceId.Substring(7));
                var reviewSet = await _db.ClassVocabularyReviewSets.FirstOrDefaultAsync(r => r.Id == reviewId && r.ClassId == id);
                if (reviewSet == null) return NotFound();

                var items = await _db.ClassVocabularyReviewSetUnits
                    .Where(u => u.ReviewSetId == reviewId)
                    .SelectMany(u => u.ClassLesson.VocabularySet.Items)
                    .Select(i => new { id = i.Id, word = i.Word, meaning = i.Meaning })
                    .Distinct()
                    .ToListAsync();
                return Ok(items);
            }

            return BadRequest();
        }
    }
}
