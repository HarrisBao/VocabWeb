using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSkillOfferingFeedbackProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassSkillOfferings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSkillOfferings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassSkillOfferings_AspNetUsers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ClassSkillOfferings_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackCycles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackCycles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClassLearningStages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassSkillOfferingId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassLearningStages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassLearningStages_ClassSkillOfferings_ClassSkillOfferingId",
                        column: x => x.ClassSkillOfferingId,
                        principalTable: "ClassSkillOfferings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackTemplateCriteria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FeedbackTemplateId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackTemplateCriteria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedbackTemplateCriteria_FeedbackTemplates_FeedbackTemplateId",
                        column: x => x.FeedbackTemplateId,
                        principalTable: "FeedbackTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentSkillFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    HomeClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    HostClassSkillOfferingId = table.Column<int>(type: "int", nullable: true),
                    FeedbackCycleId = table.Column<int>(type: "int", nullable: false),
                    FeedbackTemplateId = table.Column<int>(type: "int", nullable: true),
                    TaFeedbackHtml = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TeacherFeedbackHtml = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TaUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TeacherUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentSkillFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_AspNetUsers_TaUserId",
                        column: x => x.TaUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_AspNetUsers_TeacherUserId",
                        column: x => x.TeacherUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_ClassEnrollments_HomeClassEnrollmentId",
                        column: x => x.HomeClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_ClassSkillOfferings_HostClassSkillOfferingId",
                        column: x => x.HostClassSkillOfferingId,
                        principalTable: "ClassSkillOfferings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_FeedbackCycles_FeedbackCycleId",
                        column: x => x.FeedbackCycleId,
                        principalTable: "FeedbackCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_FeedbackTemplates_FeedbackTemplateId",
                        column: x => x.FeedbackTemplateId,
                        principalTable: "FeedbackTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbacks_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LearningMilestones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassLearningStageId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningMilestones_ClassLearningStages_ClassLearningStageId",
                        column: x => x.ClassLearningStageId,
                        principalTable: "ClassLearningStages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentSkillFeedbackScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentSkillFeedbackId = table.Column<int>(type: "int", nullable: false),
                    FeedbackTemplateCriterionId = table.Column<int>(type: "int", nullable: false),
                    ScoreCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScoreValue = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentSkillFeedbackScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbackScores_FeedbackTemplateCriteria_FeedbackTemplateCriterionId",
                        column: x => x.FeedbackTemplateCriterionId,
                        principalTable: "FeedbackTemplateCriteria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentSkillFeedbackScores_StudentSkillFeedbacks_StudentSkillFeedbackId",
                        column: x => x.StudentSkillFeedbackId,
                        principalTable: "StudentSkillFeedbacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentMilestoneProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    LearningMilestoneId = table.Column<int>(type: "int", nullable: false),
                    ClassSkillOfferingId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MarkedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentMilestoneProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentMilestoneProgresses_AspNetUsers_MarkedByUserId",
                        column: x => x.MarkedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentMilestoneProgresses_ClassSkillOfferings_ClassSkillOfferingId",
                        column: x => x.ClassSkillOfferingId,
                        principalTable: "ClassSkillOfferings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentMilestoneProgresses_LearningMilestones_LearningMilestoneId",
                        column: x => x.LearningMilestoneId,
                        principalTable: "LearningMilestones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentMilestoneProgresses_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassLearningStages_ClassSkillOfferingId",
                table: "ClassLearningStages",
                column: "ClassSkillOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSkillOfferings_ClassId_Skill",
                table: "ClassSkillOfferings",
                columns: new[] { "ClassId", "Skill" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassSkillOfferings_TeacherId",
                table: "ClassSkillOfferings",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackTemplateCriteria_FeedbackTemplateId",
                table: "FeedbackTemplateCriteria",
                column: "FeedbackTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningMilestones_ClassLearningStageId",
                table: "LearningMilestones",
                column: "ClassLearningStageId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMilestoneProgresses_ClassSkillOfferingId",
                table: "StudentMilestoneProgresses",
                column: "ClassSkillOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMilestoneProgresses_LearningMilestoneId",
                table: "StudentMilestoneProgresses",
                column: "LearningMilestoneId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMilestoneProgresses_MarkedByUserId",
                table: "StudentMilestoneProgresses",
                column: "MarkedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMilestoneProgresses_StudentProfileId_LearningMilestoneId_ClassSkillOfferingId",
                table: "StudentMilestoneProgresses",
                columns: new[] { "StudentProfileId", "LearningMilestoneId", "ClassSkillOfferingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_FeedbackCycleId",
                table: "StudentSkillFeedbacks",
                column: "FeedbackCycleId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_FeedbackTemplateId",
                table: "StudentSkillFeedbacks",
                column: "FeedbackTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_HomeClassEnrollmentId",
                table: "StudentSkillFeedbacks",
                column: "HomeClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_HostClassSkillOfferingId",
                table: "StudentSkillFeedbacks",
                column: "HostClassSkillOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_StudentProfileId",
                table: "StudentSkillFeedbacks",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_TaUserId",
                table: "StudentSkillFeedbacks",
                column: "TaUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbacks_TeacherUserId",
                table: "StudentSkillFeedbacks",
                column: "TeacherUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbackScores_FeedbackTemplateCriterionId",
                table: "StudentSkillFeedbackScores",
                column: "FeedbackTemplateCriterionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSkillFeedbackScores_StudentSkillFeedbackId",
                table: "StudentSkillFeedbackScores",
                column: "StudentSkillFeedbackId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentMilestoneProgresses");

            migrationBuilder.DropTable(
                name: "StudentSkillFeedbackScores");

            migrationBuilder.DropTable(
                name: "LearningMilestones");

            migrationBuilder.DropTable(
                name: "FeedbackTemplateCriteria");

            migrationBuilder.DropTable(
                name: "StudentSkillFeedbacks");

            migrationBuilder.DropTable(
                name: "ClassLearningStages");

            migrationBuilder.DropTable(
                name: "FeedbackCycles");

            migrationBuilder.DropTable(
                name: "FeedbackTemplates");

            migrationBuilder.DropTable(
                name: "ClassSkillOfferings");
        }
    }
}
