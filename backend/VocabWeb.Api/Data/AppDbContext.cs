using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VocabularySet> VocabularySets => Set<VocabularySet>();
    public DbSet<VocabularyItem> VocabularyItems => Set<VocabularyItem>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<ClassLesson> ClassLessons => Set<ClassLesson>();
    public DbSet<ClassMember> ClassMembers => Set<ClassMember>();
    public DbSet<Test> Tests => Set<Test>();
    public DbSet<TestAttempt> TestAttempts => Set<TestAttempt>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<ClassEnrollment> ClassEnrollments => Set<ClassEnrollment>();
    public DbSet<ClassStaffAssignment> ClassStaffAssignments => Set<ClassStaffAssignment>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<ClassSessionTest> ClassSessionTests => Set<ClassSessionTest>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // VocabularySet -> Teacher
        builder.Entity<VocabularySet>()
            .HasOne(vs => vs.Teacher)
            .WithMany(u => u.VocabularySets)
            .HasForeignKey(vs => vs.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        // VocabularyItem -> VocabularySet
        builder.Entity<VocabularyItem>()
            .HasOne(vi => vi.VocabularySet)
            .WithMany(vs => vs.Items)
            .HasForeignKey(vi => vi.VocabularySetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Class -> Teacher
        builder.Entity<Class>()
            .HasOne(c => c.Teacher)
            .WithMany(u => u.Classes)
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        // ClassLesson
        builder.Entity<ClassLesson>()
            .HasOne(cl => cl.Class)
            .WithMany(c => c.Lessons)
            .HasForeignKey(cl => cl.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassLesson>()
            .HasOne(cl => cl.VocabularySet)
            .WithMany(vs => vs.ClassLessons)
            .HasForeignKey(cl => cl.VocabularySetId)
            .OnDelete(DeleteBehavior.Restrict);

        // ClassMember
        builder.Entity<ClassMember>()
            .HasOne(cm => cm.Class)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassMember>()
            .HasOne(cm => cm.Student)
            .WithMany()
            .HasForeignKey(cm => cm.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Test
        builder.Entity<Test>()
            .HasOne(t => t.Teacher)
            .WithMany(u => u.Tests)
            .HasForeignKey(t => t.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Test>()
            .HasOne(t => t.VocabularySet)
            .WithMany(vs => vs.Tests)
            .HasForeignKey(t => t.VocabularySetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Test>()
            .HasOne(t => t.Class)
            .WithMany(c => c.Tests)
            .HasForeignKey(t => t.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Test>()
            .Property(t => t.PassScore)
            .HasPrecision(4, 1);

        // TestAttempt
        builder.Entity<TestAttempt>()
            .HasOne(ta => ta.Test)
            .WithMany(t => t.Attempts)
            .HasForeignKey(ta => ta.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TestAttempt>()
            .HasOne(ta => ta.Student)
            .WithMany()
            .HasForeignKey(ta => ta.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TestAttempt>()
            .Property(ta => ta.Score)
            .HasPrecision(4, 1);

        // AttemptAnswer
        builder.Entity<AttemptAnswer>()
            .HasOne(aa => aa.TestAttempt)
            .WithMany(ta => ta.Answers)
            .HasForeignKey(aa => aa.TestAttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique index for class code
        builder.Entity<Class>()
            .HasIndex(c => c.Code)
            .IsUnique();

        // StudentProfile
        builder.Entity<StudentProfile>()
            .HasIndex(sp => sp.NormalizedPhone)
            .IsUnique()
            .HasFilter("[NormalizedPhone] IS NOT NULL");
            
        builder.Entity<StudentProfile>()
            .HasOne(sp => sp.User)
            .WithMany()
            .HasForeignKey(sp => sp.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // ClassEnrollment
        builder.Entity<ClassEnrollment>()
            .HasOne(ce => ce.Class)
            .WithMany() // We can add an Enrollments collection to Class if needed, omitting for now
            .HasForeignKey(ce => ce.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassEnrollment>()
            .HasOne(ce => ce.StudentProfile)
            .WithMany(sp => sp.Enrollments)
            .HasForeignKey(ce => ce.StudentProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ClassEnrollment>()
            .HasIndex(ce => new { ce.ClassId, ce.StudentProfileId })
            .IsUnique();

        // ClassStaffAssignment
        builder.Entity<ClassStaffAssignment>()
            .HasOne(csa => csa.Class)
            .WithMany()
            .HasForeignKey(csa => csa.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassStaffAssignment>()
            .HasOne(csa => csa.User)
            .WithMany()
            .HasForeignKey(csa => csa.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ClassStaffAssignment>()
            .HasIndex(csa => new { csa.ClassId, csa.UserId })
            .IsUnique();

        // ClassSession
        builder.Entity<ClassSession>()
            .HasOne(cs => cs.Class)
            .WithMany()
            .HasForeignKey(cs => cs.ClassId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.Entity<ClassSession>()
            .HasOne(cs => cs.CreatedBy)
            .WithMany()
            .HasForeignKey(cs => cs.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);

        // AttendanceRecord
        builder.Entity<AttendanceRecord>()
            .HasOne(ar => ar.ClassSession)
            .WithMany(cs => cs.AttendanceRecords)
            .HasForeignKey(ar => ar.ClassSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AttendanceRecord>()
            .HasOne(ar => ar.ClassEnrollment)
            .WithMany()
            .HasForeignKey(ar => ar.ClassEnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<AttendanceRecord>()
            .HasOne(ar => ar.UpdatedBy)
            .WithMany()
            .HasForeignKey(ar => ar.UpdatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<AttendanceRecord>()
            .HasIndex(ar => new { ar.ClassSessionId, ar.ClassEnrollmentId })
            .IsUnique();

        builder.Entity<ClassSessionTest>()
            .HasOne(cst => cst.ClassSession)
            .WithMany()
            .HasForeignKey(cst => cst.ClassSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassSessionTest>()
            .HasOne(cst => cst.Test)
            .WithMany()
            .HasForeignKey(cst => cst.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ClassSessionTest>()
            .HasIndex(cst => new { cst.ClassSessionId, cst.TestId })
            .IsUnique();

        // TestAttempt - new ClassEnrollment relationship
        builder.Entity<TestAttempt>()
            .HasOne(ta => ta.ClassEnrollment)
            .WithMany()
            .HasForeignKey(ta => ta.ClassEnrollmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
