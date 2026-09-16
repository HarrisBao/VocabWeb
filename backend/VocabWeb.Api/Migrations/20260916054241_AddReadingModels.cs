using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReadingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IeltsMockExamResults");

            migrationBuilder.DropTable(
                name: "WritingFeedbacks");

            migrationBuilder.DropTable(
                name: "IeltsMockExams");

            migrationBuilder.DropColumn(
                name: "ResultScale",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "Skill",
                table: "Classes");

            migrationBuilder.CreateTable(
                name: "ReadingAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingAssignments_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReadingAssignments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingAssignmentId = table.Column<int>(type: "int", nullable: false),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimeSpentSeconds = table.Column<int>(type: "int", nullable: false),
                    CorrectCount = table.Column<int>(type: "int", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingAttempts_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReadingAttempts_ReadingAssignments_ReadingAssignmentId",
                        column: x => x.ReadingAssignmentId,
                        principalTable: "ReadingAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingPassages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingAssignmentId = table.Column<int>(type: "int", nullable: false),
                    ContentHtml = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingPassages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingPassages_ReadingAssignments_ReadingAssignmentId",
                        column: x => x.ReadingAssignmentId,
                        principalTable: "ReadingAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingQuestionGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingAssignmentId = table.Column<int>(type: "int", nullable: false),
                    Instruction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InteractionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingQuestionGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingQuestionGroups_ReadingAssignments_ReadingAssignmentId",
                        column: x => x.ReadingAssignmentId,
                        principalTable: "ReadingAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionGroupId = table.Column<int>(type: "int", nullable: false),
                    DisplayNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingQuestions_ReadingQuestionGroups_QuestionGroupId",
                        column: x => x.QuestionGroupId,
                        principalTable: "ReadingQuestionGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingAcceptedAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingQuestionId = table.Column<int>(type: "int", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingAcceptedAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingAcceptedAnswers_ReadingQuestions_ReadingQuestionId",
                        column: x => x.ReadingQuestionId,
                        principalTable: "ReadingQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingAttemptAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingAttemptId = table.Column<int>(type: "int", nullable: false),
                    ReadingQuestionId = table.Column<int>(type: "int", nullable: false),
                    StudentAnswer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    CorrectAnswerSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingAttemptAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingAttemptAnswers_ReadingAttempts_ReadingAttemptId",
                        column: x => x.ReadingAttemptId,
                        principalTable: "ReadingAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReadingAttemptAnswers_ReadingQuestions_ReadingQuestionId",
                        column: x => x.ReadingQuestionId,
                        principalTable: "ReadingQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAcceptedAnswers_ReadingQuestionId",
                table: "ReadingAcceptedAnswers",
                column: "ReadingQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAssignments_ClassId",
                table: "ReadingAssignments",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAssignments_CreatedById",
                table: "ReadingAssignments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAttemptAnswers_ReadingAttemptId",
                table: "ReadingAttemptAnswers",
                column: "ReadingAttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAttemptAnswers_ReadingQuestionId",
                table: "ReadingAttemptAnswers",
                column: "ReadingQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAttempts_ClassEnrollmentId",
                table: "ReadingAttempts",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingAttempts_ReadingAssignmentId",
                table: "ReadingAttempts",
                column: "ReadingAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_ReadingAssignmentId",
                table: "ReadingPassages",
                column: "ReadingAssignmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReadingQuestionGroups_ReadingAssignmentId",
                table: "ReadingQuestionGroups",
                column: "ReadingAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingQuestions_QuestionGroupId",
                table: "ReadingQuestions",
                column: "QuestionGroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReadingAcceptedAnswers");

            migrationBuilder.DropTable(
                name: "ReadingAttemptAnswers");

            migrationBuilder.DropTable(
                name: "ReadingPassages");

            migrationBuilder.DropTable(
                name: "ReadingAttempts");

            migrationBuilder.DropTable(
                name: "ReadingQuestions");

            migrationBuilder.DropTable(
                name: "ReadingQuestionGroups");

            migrationBuilder.DropTable(
                name: "ReadingAssignments");

            migrationBuilder.AddColumn<int>(
                name: "ResultScale",
                table: "Tests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Skill",
                table: "Classes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "IeltsMockExams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    TeacherId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IeltsMockExams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IeltsMockExams_AspNetUsers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IeltsMockExams_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WritingFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    CoherenceCohesion = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GoodPoints = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GrammaticalRange = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LexicalResource = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NeedsImprovement = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextSteps = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OverallBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaskName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskResponse = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TeacherComment = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingFeedbacks_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WritingFeedbacks_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IeltsMockExamResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IeltsMockExamId = table.Column<int>(type: "int", nullable: false),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ListeningBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OverallBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RawAverage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ReadingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SpeakingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WritingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IeltsMockExamResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IeltsMockExamResults_IeltsMockExams_IeltsMockExamId",
                        column: x => x.IeltsMockExamId,
                        principalTable: "IeltsMockExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IeltsMockExamResults_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExamResults_IeltsMockExamId",
                table: "IeltsMockExamResults",
                column: "IeltsMockExamId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExamResults_StudentProfileId",
                table: "IeltsMockExamResults",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExams_ClassId",
                table: "IeltsMockExams",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExams_TeacherId",
                table: "IeltsMockExams",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingFeedbacks_ClassId",
                table: "WritingFeedbacks",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingFeedbacks_StudentProfileId",
                table: "WritingFeedbacks",
                column: "StudentProfileId");
        }
    }
}
