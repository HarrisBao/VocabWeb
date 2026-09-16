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

                foreach (var paragraph in body.Elements<Paragraph>())
                {
                    string text = paragraph.InnerText.Trim();
                    if (string.IsNullOrEmpty(text)) continue;

                    if (!inQuestionsSection && Regex.IsMatch(text, @"^Questions?\s+\d+\s*[\-\–\—\s(to)]+\s*\d+", RegexOptions.IgnoreCase))
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

                result.PassageHtml = string.Join("<br/><br/>", passageBlocks.Select(p => $"<p>{p}</p>"));

                ReadingQuestionGroup? currentGroup = null;
                int sortOrder = 0;

                foreach (var block in questionBlocks)
                {
                    if (Regex.IsMatch(block, @"^Questions?\s+\d+\s*[\-\–\—\s(to)]+\s*\d+", RegexOptions.IgnoreCase))
                    {
                        currentGroup = new ReadingQuestionGroup
                        {
                            Instruction = block,
                            InteractionType = "SHORT_TEXT",
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

                    var qMatch = Regex.Match(block, @"^(\d+)\.\s+(.*)");
                    if (qMatch.Success)
                    {
                        var qNumber = qMatch.Groups[1].Value;
                        var qContent = qMatch.Groups[2].Value;

                        if (qContent.Contains("___") || qContent.Contains("..."))
                        {
                            currentGroup.InteractionType = "INLINE_GAP";
                        }
                        else if (block.Contains("TRUE") && block.Contains("FALSE"))
                        {
                            currentGroup.InteractionType = "TRUE_FALSE_NOT_GIVEN";
                        }
                        else if (block.Contains("YES") && block.Contains("NO"))
                        {
                            currentGroup.InteractionType = "YES_NO_NOT_GIVEN";
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
                        var optMatch = Regex.Match(block, @"^[A-F]\.\s+(.*)");
                        if (optMatch.Success && currentGroup.Questions.Count > 0)
                        {
                            currentGroup.InteractionType = "MULTIPLE_CHOICE";
                            var lastQ = currentGroup.Questions.Last();
                            lastQ.Content += $"\n{block}";
                        }
                        else
                        {
                            if (currentGroup.Questions.Count == 0)
                            {
                                currentGroup.Instruction += $"\n{block}";
                            }
                            else
                            {
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
