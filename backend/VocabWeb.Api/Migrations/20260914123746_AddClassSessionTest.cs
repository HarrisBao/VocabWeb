using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClassSessionTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassSessionTests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassSessionId = table.Column<int>(type: "int", nullable: false),
                    TestId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSessionTests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassSessionTests_ClassSessions_ClassSessionId",
                        column: x => x.ClassSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassSessionTests_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessionTests_ClassSessionId_TestId",
                table: "ClassSessionTests",
                columns: new[] { "ClassSessionId", "TestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessionTests_TestId",
                table: "ClassSessionTests",
                column: "TestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassSessionTests");
        }
    }
}
