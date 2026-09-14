using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class UnifiedStudentIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClassEnrollmentId",
                table: "TestAttempts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClassSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassSessions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ClassSessions_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassStaffAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StaffRole = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassStaffAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassStaffAssignments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassStaffAssignments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NormalizedPhone = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ClassEnrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassEnrollments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassEnrollments_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassSessionId = table.Column<int>(type: "int", nullable: false),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_ClassSessions_ClassSessionId",
                        column: x => x.ClassSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TestAttempts_ClassEnrollmentId",
                table: "TestAttempts",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_ClassEnrollmentId",
                table: "AttendanceRecords",
                column: "ClassEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_ClassSessionId_ClassEnrollmentId",
                table: "AttendanceRecords",
                columns: new[] { "ClassSessionId", "ClassEnrollmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_UpdatedById",
                table: "AttendanceRecords",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_ClassId_StudentProfileId",
                table: "ClassEnrollments",
                columns: new[] { "ClassId", "StudentProfileId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_StudentProfileId",
                table: "ClassEnrollments",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_ClassId",
                table: "ClassSessions",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_CreatedById",
                table: "ClassSessions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ClassStaffAssignments_ClassId_UserId",
                table: "ClassStaffAssignments",
                columns: new[] { "ClassId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassStaffAssignments_UserId",
                table: "ClassStaffAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_NormalizedPhone",
                table: "StudentProfiles",
                column: "NormalizedPhone",
                unique: true,
                filter: "[NormalizedPhone] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_UserId",
                table: "StudentProfiles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestAttempts_ClassEnrollments_ClassEnrollmentId",
                table: "TestAttempts",
                column: "ClassEnrollmentId",
                principalTable: "ClassEnrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Data Migration
            migrationBuilder.Sql(@"
                -- 1. Create StudentProfiles for users that don't have one but are in ClassMembers
                INSERT INTO StudentProfiles (FullName, UserId, CreatedAt, UpdatedAt)
                SELECT DISTINCT ISNULL(u.FullName, 'Unknown'), u.Id, GETUTCDATE(), GETUTCDATE()
                FROM ClassMembers cm
                JOIN AspNetUsers u ON cm.StudentId = u.Id
                WHERE NOT EXISTS (
                    SELECT 1 FROM StudentProfiles sp WHERE sp.UserId = u.Id
                );

                -- 2. Create ClassEnrollments
                INSERT INTO ClassEnrollments (ClassId, StudentProfileId, JoinedAt)
                SELECT cm.ClassId, sp.Id, cm.JoinedAt
                FROM ClassMembers cm
                JOIN AspNetUsers u ON cm.StudentId = u.Id
                JOIN StudentProfiles sp ON sp.UserId = u.Id;

                -- 3. Update existing TestAttempts that have StudentId
                UPDATE ta
                SET ta.ClassEnrollmentId = ce.Id
                FROM TestAttempts ta
                JOIN Tests t ON ta.TestId = t.Id
                JOIN StudentProfiles sp ON sp.UserId = ta.StudentId
                JOIN ClassEnrollments ce ON ce.ClassId = t.ClassId AND ce.StudentProfileId = sp.Id
                WHERE ta.StudentId IS NOT NULL AND t.ClassId IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestAttempts_ClassEnrollments_ClassEnrollmentId",
                table: "TestAttempts");

            migrationBuilder.DropTable(
                name: "AttendanceRecords");

            migrationBuilder.DropTable(
                name: "ClassStaffAssignments");

            migrationBuilder.DropTable(
                name: "ClassEnrollments");

            migrationBuilder.DropTable(
                name: "ClassSessions");

            migrationBuilder.DropTable(
                name: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_TestAttempts_ClassEnrollmentId",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "ClassEnrollmentId",
                table: "TestAttempts");
        }
    }
}
