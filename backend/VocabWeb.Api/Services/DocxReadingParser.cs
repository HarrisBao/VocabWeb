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
                var allBlocks = new List<string>();

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
                        allBlocks.Add(text);
                    }
                    else
                    {
                        passageBlocks.Add(text);
                    }
                }

                result.PassageHtml = string.Join("<br/><br/>", passageBlocks.Select(p => $"<p>{p}</p>"));

                // Parse questions
                ReadingQuestionGroup? currentGroup = null;
                int sortOrder = 0;

                bool parsingInstruction = false;
                bool parsingReferenceList = false;

                for (int i = 0; i < allBlocks.Count; i++)
                {
                    var block = allBlocks[i];

                    var groupHeaderMatch = Regex.Match(block, @"^Questions?\s+\d+\s*[\-\–\—\s(to)]+\s*\d+", RegexOptions.IgnoreCase);
                    if (groupHeaderMatch.Success)
                    {
                        currentGroup = new ReadingQuestionGroup
                        {
                            DisplayLabel = groupHeaderMatch.Value,
                            Instruction = "",
                            InteractionType = "SHORT_TEXT",
                            SortOrder = ++sortOrder
                        };
                        result.QuestionGroups.Add(currentGroup);
                        parsingInstruction = true;
                        parsingReferenceList = false;
                        continue;
                    }

                    if (currentGroup == null)
                    {
                        currentGroup = new ReadingQuestionGroup
                        {
                            DisplayLabel = "Questions",
                            Instruction = "",
                            InteractionType = "SHORT_TEXT",
                            SortOrder = ++sortOrder
                        };
                        result.QuestionGroups.Add(currentGroup);
                        parsingInstruction = true;
                    }

                    // Check for List of People / Reference list
                    if (Regex.IsMatch(block, @"^(List of People|Reference list)", RegexOptions.IgnoreCase))
                    {
                        parsingInstruction = false;
                        parsingReferenceList = true;
                        continue;
                    }

                    // Check if it looks like a reference list item (e.g. A Matt Elliot, A - Matt Elliot)
                    var refItemMatch = Regex.Match(block, @"^([A-Z])\s*[\-\–\—]?\s*(.+)$");
                    if (parsingReferenceList && refItemMatch.Success && refItemMatch.Groups[1].Value.Length == 1)
                    {
                        if (string.IsNullOrEmpty(currentGroup.ReferenceItems))
                            currentGroup.ReferenceItems = "[]";
                        
                        var items = System.Text.Json.JsonSerializer.Deserialize<List<object>>(currentGroup.ReferenceItems) ?? new List<object>();
                        items.Add(new { key = refItemMatch.Groups[1].Value, label = refItemMatch.Groups[2].Value.Trim() });
                        currentGroup.ReferenceItems = System.Text.Json.JsonSerializer.Serialize(items);
                        continue;
                    }

                    // Explicit question matching like "14. Reference to..." or "14 Reference to..."
                    var qMatch = Regex.Match(block, @"^(\d+)\.?\s+(.*)");
                    if (qMatch.Success)
                    {
                        parsingInstruction = false;
                        parsingReferenceList = false;

                        var qNumber = qMatch.Groups[1].Value;
                        var qContent = qMatch.Groups[2].Value;

                        currentGroup.Questions.Add(new ReadingQuestion
                        {
                            DisplayNumber = qNumber,
                            Content = qContent,
                            SortOrder = currentGroup.Questions.Count + 1
                        });
                        continue;
                    }

                    // Inline gap matching like "24__________" or "24.__________"
                    var inlineGapMatch = Regex.Match(block, @"\b(\d+)\.?\s*[_]{3,}");
                    if (inlineGapMatch.Success)
                    {
                        parsingInstruction = false;
                        parsingReferenceList = false;

                        currentGroup.InteractionType = "INLINE_GAP";
                        currentGroup.AcademicQuestionType = "SUMMARY_COMPLETION";

                        var matches = Regex.Matches(block, @"\b(\d+)\.?\s*[_]{3,}");
                        var structuredLine = block;
                        foreach (Match m in matches)
                        {
                            var qNum = m.Groups[1].Value;
                            currentGroup.Questions.Add(new ReadingQuestion
                            {
                                DisplayNumber = qNum,
                                Content = "",
                                SortOrder = currentGroup.Questions.Count + 1
                            });
                            structuredLine = structuredLine.Replace(m.Value, $"{{{{Q{qNum}}}}}");
                        }

                        currentGroup.StructuredContent = string.IsNullOrEmpty(currentGroup.StructuredContent)
                            ? structuredLine
                            : currentGroup.StructuredContent + "\n\n" + structuredLine;

                        continue;
                    }
                    
                    // If we get here and there are gaps in the block without a number (rare but possible), we might need logic.
                    // But usually they have numbers.

                    // If it is neither question nor ref list, it's either instruction or continuation of previous question
                    if (parsingInstruction)
                    {
                        currentGroup.Instruction = string.IsNullOrEmpty(currentGroup.Instruction) 
                            ? block 
                            : currentGroup.Instruction + "\n" + block;
                    }
                    else if (currentGroup.Questions.Count > 0 && currentGroup.InteractionType != "INLINE_GAP")
                    {
                        var lastQ = currentGroup.Questions.Last();
                        lastQ.Content += $"\n{block}";
                    }
                    else if (currentGroup.InteractionType == "INLINE_GAP")
                    {
                        currentGroup.StructuredContent = string.IsNullOrEmpty(currentGroup.StructuredContent)
                            ? block
                            : currentGroup.StructuredContent + "\n\n" + block;
                    }
                }

                // Final pass to guess AcademicQuestionType and InteractionType from Instructions
                foreach (var group in result.QuestionGroups)
                {
                    var instr = group.Instruction.ToLower();

                    if (string.IsNullOrEmpty(group.AcademicQuestionType))
                    {
                        if (instr.Contains("match") && instr.Contains("person") || !string.IsNullOrEmpty(group.ReferenceItems))
                        {
                            group.AcademicQuestionType = "MATCHING_PEOPLE";
                            group.InteractionType = "SHORT_LETTER_RESPONSE";
                        }
                        else if (instr.Contains("which section contains"))
                        {
                            group.AcademicQuestionType = "MATCHING_INFORMATION";
                            group.InteractionType = "SHORT_LETTER_RESPONSE";
                        }
                        else if (instr.Contains("true") && instr.Contains("false"))
                        {
                            group.AcademicQuestionType = "TRUE_FALSE_NOT_GIVEN";
                            group.InteractionType = "TRUE_FALSE_NOT_GIVEN";
                        }
                        else if (instr.Contains("yes") && instr.Contains("no"))
                        {
                            group.AcademicQuestionType = "YES_NO_NOT_GIVEN";
                            group.InteractionType = "YES_NO_NOT_GIVEN";
                        }
                        else if (instr.Contains("summary"))
                        {
                            group.AcademicQuestionType = "SUMMARY_COMPLETION";
                        }
                    }

                    // Detect allowed domains like A-G or A-C
                    var domainMatch = Regex.Match(group.Instruction, @"([A-Z])\s*[\-\–\—(to)]+\s*([A-Z])");
                    if (domainMatch.Success)
                    {
                        group.AllowedAnswerDomain = $"{domainMatch.Groups[1].Value}-{domainMatch.Groups[2].Value}";
                        group.InteractionType = "SHORT_LETTER_RESPONSE";
                    }
                }
            }

            return result;
        }
    }
}
