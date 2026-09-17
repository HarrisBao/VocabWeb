using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddClassSessionSkillAndTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassSkillSchedule_Classes_ClassId",
                table: "ClassSkillSchedule");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignment_AspNetUsers_CreatedByUserId",
                table: "EnrollmentSkillAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignment_ClassEnrollments_ClassEnrollmentId",
                table: "EnrollmentSkillAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignment_Classes_SourceClassId",
                table: "EnrollmentSkillAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignment_Classes_TargetClassId",
                table: "EnrollmentSkillAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequest_AspNetUsers_CreatedByUserId",
                table: "StudentScheduleRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequest_ClassEnrollments_ClassEnrollmentId",
                table: "StudentScheduleRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequest_ClassSessions_AffectedSessionId",
                table: "StudentScheduleRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequest_StudentProfiles_StudentProfileId",
                table: "StudentScheduleRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverride_AspNetUsers_CreatedByUserId",
                table: "StudentSessionOverride");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverride_ClassEnrollments_ClassEnrollmentId",
                table: "StudentSessionOverride");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverride_ClassSessions_OriginalSessionId",
                table: "StudentSessionOverride");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverride_ClassSessions_TargetSessionId",
                table: "StudentSessionOverride");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentSessionOverride",
                table: "StudentSessionOverride");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentScheduleRequest",
                table: "StudentScheduleRequest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EnrollmentSkillAssignment",
                table: "EnrollmentSkillAssignment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClassSkillSchedule",
                table: "ClassSkillSchedule");

            migrationBuilder.RenameTable(
                name: "StudentSessionOverride",
                newName: "StudentSessionOverrides");

            migrationBuilder.RenameTable(
                name: "StudentScheduleRequest",
                newName: "StudentScheduleRequests");

            migrationBuilder.RenameTable(
                name: "EnrollmentSkillAssignment",
                newName: "EnrollmentSkillAssignments");

            migrationBuilder.RenameTable(
                name: "ClassSkillSchedule",
                newName: "ClassSkillSchedules");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverride_TargetSessionId",
                table: "StudentSessionOverrides",
                newName: "IX_StudentSessionOverrides_TargetSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverride_OriginalSessionId",
                table: "StudentSessionOverrides",
                newName: "IX_StudentSessionOverrides_OriginalSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverride_CreatedByUserId",
                table: "StudentSessionOverrides",
                newName: "IX_StudentSessionOverrides_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverride_ClassEnrollmentId",
                table: "StudentSessionOverrides",
                newName: "IX_StudentSessionOverrides_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequest_StudentProfileId",
                table: "StudentScheduleRequests",
                newName: "IX_StudentScheduleRequests_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequest_CreatedByUserId",
                table: "StudentScheduleRequests",
                newName: "IX_StudentScheduleRequests_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequest_ClassEnrollmentId",
                table: "StudentScheduleRequests",
                newName: "IX_StudentScheduleRequests_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequest_AffectedSessionId",
                table: "StudentScheduleRequests",
                newName: "IX_StudentScheduleRequests_AffectedSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignment_TargetClassId",
                table: "EnrollmentSkillAssignments",
                newName: "IX_EnrollmentSkillAssignments_TargetClassId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignment_SourceClassId",
                table: "EnrollmentSkillAssignments",
                newName: "IX_EnrollmentSkillAssignments_SourceClassId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignment_CreatedByUserId",
                table: "EnrollmentSkillAssignments",
                newName: "IX_EnrollmentSkillAssignments_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignment_ClassEnrollmentId",
                table: "EnrollmentSkillAssignments",
                newName: "IX_EnrollmentSkillAssignments_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_ClassSkillSchedule_ClassId",
                table: "ClassSkillSchedules",
                newName: "IX_ClassSkillSchedules_ClassId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentSessionOverrides",
                table: "StudentSessionOverrides",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentScheduleRequests",
                table: "StudentScheduleRequests",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EnrollmentSkillAssignments",
                table: "EnrollmentSkillAssignments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClassSkillSchedules",
                table: "ClassSkillSchedules",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassSkillSchedules_Classes_ClassId",
                table: "ClassSkillSchedules",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignments_AspNetUsers_CreatedByUserId",
                table: "EnrollmentSkillAssignments",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignments_ClassEnrollments_ClassEnrollmentId",
                table: "EnrollmentSkillAssignments",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignments_Classes_SourceClassId",
                table: "EnrollmentSkillAssignments",
                column: "SourceClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignments_Classes_TargetClassId",
                table: "EnrollmentSkillAssignments",
                column: "TargetClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequests_AspNetUsers_CreatedByUserId",
                table: "StudentScheduleRequests",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequests_ClassEnrollments_ClassEnrollmentId",
                table: "StudentScheduleRequests",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequests_ClassSessions_AffectedSessionId",
                table: "StudentScheduleRequests",
                column: "AffectedSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequests_StudentProfiles_StudentProfileId",
                table: "StudentScheduleRequests",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverrides_AspNetUsers_CreatedByUserId",
                table: "StudentSessionOverrides",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverrides_ClassEnrollments_ClassEnrollmentId",
                table: "StudentSessionOverrides",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverrides_ClassSessions_OriginalSessionId",
                table: "StudentSessionOverrides",
                column: "OriginalSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverrides_ClassSessions_TargetSessionId",
                table: "StudentSessionOverrides",
                column: "TargetSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassSkillSchedules_Classes_ClassId",
                table: "ClassSkillSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignments_AspNetUsers_CreatedByUserId",
                table: "EnrollmentSkillAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignments_ClassEnrollments_ClassEnrollmentId",
                table: "EnrollmentSkillAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignments_Classes_SourceClassId",
                table: "EnrollmentSkillAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentSkillAssignments_Classes_TargetClassId",
                table: "EnrollmentSkillAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequests_AspNetUsers_CreatedByUserId",
                table: "StudentScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequests_ClassEnrollments_ClassEnrollmentId",
                table: "StudentScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequests_ClassSessions_AffectedSessionId",
                table: "StudentScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentScheduleRequests_StudentProfiles_StudentProfileId",
                table: "StudentScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverrides_AspNetUsers_CreatedByUserId",
                table: "StudentSessionOverrides");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverrides_ClassEnrollments_ClassEnrollmentId",
                table: "StudentSessionOverrides");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverrides_ClassSessions_OriginalSessionId",
                table: "StudentSessionOverrides");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionOverrides_ClassSessions_TargetSessionId",
                table: "StudentSessionOverrides");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentSessionOverrides",
                table: "StudentSessionOverrides");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentScheduleRequests",
                table: "StudentScheduleRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EnrollmentSkillAssignments",
                table: "EnrollmentSkillAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClassSkillSchedules",
                table: "ClassSkillSchedules");

            migrationBuilder.RenameTable(
                name: "StudentSessionOverrides",
                newName: "StudentSessionOverride");

            migrationBuilder.RenameTable(
                name: "StudentScheduleRequests",
                newName: "StudentScheduleRequest");

            migrationBuilder.RenameTable(
                name: "EnrollmentSkillAssignments",
                newName: "EnrollmentSkillAssignment");

            migrationBuilder.RenameTable(
                name: "ClassSkillSchedules",
                newName: "ClassSkillSchedule");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverrides_TargetSessionId",
                table: "StudentSessionOverride",
                newName: "IX_StudentSessionOverride_TargetSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverrides_OriginalSessionId",
                table: "StudentSessionOverride",
                newName: "IX_StudentSessionOverride_OriginalSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverrides_CreatedByUserId",
                table: "StudentSessionOverride",
                newName: "IX_StudentSessionOverride_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentSessionOverrides_ClassEnrollmentId",
                table: "StudentSessionOverride",
                newName: "IX_StudentSessionOverride_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequests_StudentProfileId",
                table: "StudentScheduleRequest",
                newName: "IX_StudentScheduleRequest_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequests_CreatedByUserId",
                table: "StudentScheduleRequest",
                newName: "IX_StudentScheduleRequest_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequests_ClassEnrollmentId",
                table: "StudentScheduleRequest",
                newName: "IX_StudentScheduleRequest_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_StudentScheduleRequests_AffectedSessionId",
                table: "StudentScheduleRequest",
                newName: "IX_StudentScheduleRequest_AffectedSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignments_TargetClassId",
                table: "EnrollmentSkillAssignment",
                newName: "IX_EnrollmentSkillAssignment_TargetClassId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignments_SourceClassId",
                table: "EnrollmentSkillAssignment",
                newName: "IX_EnrollmentSkillAssignment_SourceClassId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignments_CreatedByUserId",
                table: "EnrollmentSkillAssignment",
                newName: "IX_EnrollmentSkillAssignment_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_EnrollmentSkillAssignments_ClassEnrollmentId",
                table: "EnrollmentSkillAssignment",
                newName: "IX_EnrollmentSkillAssignment_ClassEnrollmentId");

            migrationBuilder.RenameIndex(
                name: "IX_ClassSkillSchedules_ClassId",
                table: "ClassSkillSchedule",
                newName: "IX_ClassSkillSchedule_ClassId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentSessionOverride",
                table: "StudentSessionOverride",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentScheduleRequest",
                table: "StudentScheduleRequest",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EnrollmentSkillAssignment",
                table: "EnrollmentSkillAssignment",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClassSkillSchedule",
                table: "ClassSkillSchedule",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassSkillSchedule_Classes_ClassId",
                table: "ClassSkillSchedule",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignment_AspNetUsers_CreatedByUserId",
                table: "EnrollmentSkillAssignment",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignment_ClassEnrollments_ClassEnrollmentId",
                table: "EnrollmentSkillAssignment",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignment_Classes_SourceClassId",
                table: "EnrollmentSkillAssignment",
                column: "SourceClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentSkillAssignment_Classes_TargetClassId",
                table: "EnrollmentSkillAssignment",
                column: "TargetClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequest_AspNetUsers_CreatedByUserId",
                table: "StudentScheduleRequest",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequest_ClassEnrollments_ClassEnrollmentId",
                table: "StudentScheduleRequest",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequest_ClassSessions_AffectedSessionId",
                table: "StudentScheduleRequest",
                column: "AffectedSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentScheduleRequest_StudentProfiles_StudentProfileId",
                table: "StudentScheduleRequest",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverride_AspNetUsers_CreatedByUserId",
                table: "StudentSessionOverride",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverride_ClassEnrollments_ClassEnrollmentId",
                table: "StudentSessionOverride",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverride_ClassSessions_OriginalSessionId",
                table: "StudentSessionOverride",
                column: "OriginalSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionOverride_ClassSessions_TargetSessionId",
                table: "StudentSessionOverride",
                column: "TargetSessionId",
                principalTable: "ClassSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
