using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.Models
{
    public class ReadingAssignment
    {
        public int Id { get; set; }
        
        public int? ClassId { get; set; } // Deprecated, use ClassAssignments
        public Class? Class { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public int DurationMinutes { get; set; } = 60;

        public string Status { get; set; } = "DRAFT"; // DRAFT, PUBLISHED

        public string? CreatedById { get; set; }
        public ApplicationUser? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ReadingPassage? Passage { get; set; }
        public ICollection<ReadingQuestionGroup> QuestionGroups { get; set; } = new List<ReadingQuestionGroup>();
        public ICollection<ReadingAttempt> Attempts { get; set; } = new List<ReadingAttempt>();
        public ICollection<ReadingClassAssignment> ClassAssignments { get; set; } = new List<ReadingClassAssignment>();
    }

    public class ReadingPassage
    {
        public int Id { get; set; }
        
        public int ReadingAssignmentId { get; set; }
        public ReadingAssignment ReadingAssignment { get; set; } = null!;

        public string ContentHtml { get; set; } = string.Empty; // Structured/Sanitized HTML or JSON
    }

    public class ReadingQuestionGroup
    {
        public int Id { get; set; }

        public int ReadingAssignmentId { get; set; }
        public ReadingAssignment ReadingAssignment { get; set; } = null!;

        [MaxLength(100)]
        public string DisplayLabel { get; set; } = string.Empty;

        public string Instruction { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string AcademicQuestionType { get; set; } = string.Empty;

        // e.g., SHORT_TEXT, MULTIPLE_CHOICE, TRUE_FALSE_NOT_GIVEN, INLINE_GAP, SHORT_LETTER_RESPONSE
        [MaxLength(50)]
        public string InteractionType { get; set; } = string.Empty;

        [MaxLength(50)]
        public string AllowedAnswerDomain { get; set; } = string.Empty;

        public string? ReferenceItems { get; set; } // JSON serialized List of items (e.g., A - Matt Elliot, B - Karen Russell)

        public string? StructuredContent { get; set; } // Template text for inline gaps

        public int SortOrder { get; set; } = 0;

        public ICollection<ReadingQuestion> Questions { get; set; } = new List<ReadingQuestion>();
    }

    public class ReadingQuestion
    {
        public int Id { get; set; }

        public int QuestionGroupId { get; set; }
        public ReadingQuestionGroup QuestionGroup { get; set; } = null!;

        // The original display number like "14", "15", "14-18"
        [MaxLength(50)]
        public string DisplayNumber { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        public int SortOrder { get; set; } = 0;

        // E.g., for multiple choice options serialized as JSON
        public string? Metadata { get; set; } 

        public ICollection<ReadingAcceptedAnswer> AcceptedAnswers { get; set; } = new List<ReadingAcceptedAnswer>();
    }

    public class ReadingAcceptedAnswer
    {
        public int Id { get; set; }

        public int ReadingQuestionId { get; set; }
        public ReadingQuestion ReadingQuestion { get; set; } = null!;

        public string Answer { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = true;
    }

    public class ReadingAttempt
    {
        public int Id { get; set; }

        public int ReadingAssignmentId { get; set; }
        public ReadingAssignment ReadingAssignment { get; set; } = null!;

        public int ClassEnrollmentId { get; set; }
        public ClassEnrollment ClassEnrollment { get; set; } = null!;

        public int AttemptNumber { get; set; } = 1;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }

        public int TimeSpentSeconds { get; set; } = 0;
        public int AllowedDurationSecondsSnapshot { get; set; } = 0;
        public int OvertimeSeconds { get; set; } = 0;

        public int CorrectCount { get; set; } = 0;
        public int TotalQuestions { get; set; } = 0;

        public ICollection<ReadingAttemptAnswer> Answers { get; set; } = new List<ReadingAttemptAnswer>();
    }

    public class ReadingAttemptAnswer
    {
        public int Id { get; set; }

        public int ReadingAttemptId { get; set; }
        public ReadingAttempt ReadingAttempt { get; set; } = null!;

        public int ReadingQuestionId { get; set; }
        public ReadingQuestion ReadingQuestion { get; set; } = null!;

        public string StudentAnswer { get; set; } = string.Empty;
        
        public bool IsCorrect { get; set; } = false;

        // Snapshot of correct answer at the time of submission
        public string CorrectAnswerSnapshot { get; set; } = string.Empty;
    }

    public class ReadingClassAssignment
    {
        public int Id { get; set; }

        public int ReadingAssignmentId { get; set; }
        public ReadingAssignment ReadingAssignment { get; set; } = null!;

        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}