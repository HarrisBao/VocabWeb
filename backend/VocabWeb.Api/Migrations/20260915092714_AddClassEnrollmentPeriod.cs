using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClassEnrollmentPeriod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassEnrollmentPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassEnrollmentPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassEnrollmentPeriods_ClassEnrollments_ClassEnrollmentId",
                        column: x => x.ClassEnrollmentId,
                        principalTable: "ClassEnrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("INSERT INTO ClassEnrollmentPeriods (ClassEnrollmentId, StartedAt, EndedAt) SELECT Id, JoinedAt, CASE WHEN IsActive = CAST(0 AS bit) THEN LeftAt ELSE NULL END FROM ClassEnrollments;");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollmentPeriods_ClassEnrollmentId",
                table: "ClassEnrollmentPeriods",
                column: "ClassEnrollmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassEnrollmentPeriods");
        }
    }
}

