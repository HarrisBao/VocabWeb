using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduleModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "ClassSessions",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "Skill",
                table: "ClassSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "ClassSessions",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.CreateTable(
                name: "ClassSkillSchedule",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSkillSchedule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassSkillSchedule_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EnrollmentSkillAssignment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    SourceClassId = table.Column<int>(type: "int", nullable: false),
                    TargetClassId = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignmentType = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentSkillAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnrollmentSkillAssignment_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EnrollmentSkillAssignment_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EnrollmentSkillAssignment_Classes_SourceClassId",
                        column: x => x.SourceClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EnrollmentSkillAssignment_Classes_TargetClassId",
                        column: x => x.TargetClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentScheduleRequest",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<int>(type: "int", nullable: false),
                    AffectedSessionId = table.Column<int>(type: "int", nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Availability = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentScheduleRequest", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentScheduleRequest_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentScheduleRequest_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentScheduleRequest_ClassSessions_AffectedSessionId",
                        column: x => x.AffectedSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentScheduleRequest_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentSessionOverride",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    OriginalSessionId = table.Column<int>(type: "int", nullable: false),
                    TargetSessionId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentSessionOverride", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentSessionOverride_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentSessionOverride_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentSessionOverride_ClassSessions_OriginalSessionId",
                        column: x => x.OriginalSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentSessionOverride_ClassSessions_TargetSessionId",
                        column: x => x.TargetSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassSkillSchedule_ClassId",
                table: "ClassSkillSchedule",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentSkillAssignment_ClassEnrollmentId",
                table: "EnrollmentSkillAssignment",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentSkillAssignment_CreatedByUserId",
                table: "EnrollmentSkillAssignment",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentSkillAssignment_SourceClassId",
                table: "EnrollmentSkillAssignment",
                column: "SourceClassId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentSkillAssignment_TargetClassId",
                table: "EnrollmentSkillAssignment",
                column: "TargetClassId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentScheduleRequest_AffectedSessionId",
                table: "StudentScheduleRequest",
                column: "AffectedSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentScheduleRequest_ClassEnrollmentId",
                table: "StudentScheduleRequest",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentScheduleRequest_CreatedByUserId",
                table: "StudentScheduleRequest",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentScheduleRequest_StudentProfileId",
                table: "StudentScheduleRequest",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionOverride_ClassEnrollmentId",
                table: "StudentSessionOverride",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionOverride_CreatedByUserId",
                table: "StudentSessionOverride",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionOverride_OriginalSessionId",
                table: "StudentSessionOverride",
                column: "OriginalSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionOverride_TargetSessionId",
                table: "StudentSessionOverride",
                column: "TargetSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassSkillSchedule");

            migrationBuilder.DropTable(
                name: "EnrollmentSkillAssignment");

            migrationBuilder.DropTable(
                name: "StudentScheduleRequest");

            migrationBuilder.DropTable(
                name: "StudentSessionOverride");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "ClassSessions");

            migrationBuilder.DropColumn(
                name: "Skill",
                table: "ClassSessions");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "ClassSessions");
        }
    }
}
