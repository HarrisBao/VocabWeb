using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services
{
    public class DocxReadingParser
    {
        public class ParseResult
        {
            public string PassageHtml { get; set; } = string.Empty;
            public List<ReadingQuestionGroup> QuestionGroups { get; set; } = new List<ReadingQuestionGroup>();
        }

        public ParseResult Parse(Stream docxStream)
        {
            var result = new ParseResult();
            
            using (var wordDoc = WordprocessingDocument.Open(docxStream, false))
            {
                var body = wordDoc.MainDocumentPart?.Document.Body;
                if (body == null) return result;

                bool inQuestionsSection = false;
                var passageBlocks = new List<string>();
                var questionBlocks = new List<string>();

                // Simplified parsing: 
                // We split into Passage and Questions by looking for a paragraph starting with "Questions XX-YY"
                foreach (var paragraph in body.Elements<Paragraph>())
                {
                    string text = paragraph.InnerText.Trim();
                    if (string.IsNullOrEmpty(text)) continue;

                    if (!inQuestionsSection && Regex.IsMatch(text, @"^Questions?\s+\d+[\-–]\d+", RegexOptions.IgnoreCase))
                    {
                        inQuestionsSection = true;
                    }

                    if (inQuestionsSection)
                    {
                        questionBlocks.Add(text);
                    }
                    else
                    {
                        passageBlocks.Add(text);
                    }
                }

                // Process Passage
                result.PassageHtml = string.Join("<br/><br/>", passageBlocks.Select(p => $"<p>{p}</p>"));

                // Process Questions
                ReadingQuestionGroup currentGroup = null;
                int sortOrder = 0;

                foreach (var block in questionBlocks)
                {
                    // Is it an instruction / group header?
                    if (Regex.IsMatch(block, @"^Questions?\s+\d+[\-–]\d+", RegexOptions.IgnoreCase))
                    {
                        currentGroup = new ReadingQuestionGroup
                        {
                            Instruction = block,
                            InteractionType = "SHORT_TEXT", // default
                            SortOrder = ++sortOrder
                        };
                        result.QuestionGroups.Add(currentGroup);
                        continue;
                    }

                    if (currentGroup == null)
                    {
                        currentGroup = new ReadingQuestionGroup
                        {
                            Instruction = "Questions",
                            InteractionType = "SHORT_TEXT",
                            SortOrder = ++sortOrder
                        };
                        result.QuestionGroups.Add(currentGroup);
                    }

                    // Is it a question? (e.g. "14. reference to...")
                    var qMatch = Regex.Match(block, @"^(\d+)\.\s+(.*)");
                    if (qMatch.Success)
                    {
                        var qNumber = qMatch.Groups[1].Value;
                        var qContent = qMatch.Groups[2].Value;

                        // Check for inline gaps
                        if (qContent.Contains("___") || qContent.Contains("..."))
                        {
                            currentGroup.InteractionType = "INLINE_GAP";
                        }
                        else if (block.Contains("TRUE") && block.Contains("FALSE"))
                        {
                            currentGroup.InteractionType = "TRUE_FALSE_NOT_GIVEN";
                        }

                        currentGroup.Questions.Add(new ReadingQuestion
                        {
                            DisplayNumber = qNumber,
                            Content = qContent,
                            SortOrder = currentGroup.Questions.Count + 1
                        });
                    }
                    else
                    {
                        // Maybe it's a multiple choice option like "A. ...", or just instruction continuation
                        var optMatch = Regex.Match(block, @"^[A-F]\.\s+(.*)");
                        if (optMatch.Success && currentGroup.Questions.Count > 0)
                        {
                            currentGroup.InteractionType = "MULTIPLE_CHOICE";
                            var lastQ = currentGroup.Questions.Last();
                            lastQ.Content += $"\n{block}";
                        }
                        else
                        {
                            // Append to instruction if we haven't found any questions yet
                            if (currentGroup.Questions.Count == 0)
                            {
                                currentGroup.Instruction += $"\n{block}";
                            }
                            else
                            {
                                // Or append to last question
                                var lastQ = currentGroup.Questions.Last();
                                lastQ.Content += $"\n{block}";
                            }
                        }
                    }
                }
            }

            return result;
        }
    }
}
