using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.DTOs;

public class ClassDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FixedLinkToken { get; set; } = string.Empty;
    public string FixedLinkUrl { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ClassLessonDto> Lessons { get; set; } = new();
    public List<ClassMemberDto> Members { get; set; } = new();
}

public class CreateClassDto
{
    [Required(ErrorMessage = "Tên lớp học không được để trống")]
    public string Name { get; set; } = string.Empty;

    public string? Code { get; set; }
    public string? Description { get; set; }
}

public class ClassLessonDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public int VocabularySetId { get; set; }
    public string VocabularySetTitle { get; set; } = string.Empty;
    public string VocabularySetLevel { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public bool IsPinned { get; set; }
    public bool IsHidden { get; set; }
    public int OrderIndex { get; set; }
    public DateTime AddedAt { get; set; }
}

public class AssignLessonDto
{
    [Required]
    public int VocabularySetId { get; set; }
    public bool IsPinned { get; set; }
}

public class ClassMemberDto
{
    public int Id { get; set; }
    public int StudentProfileId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? UserId { get; set; }
    public DateTime JoinedAt { get; set; }
}
