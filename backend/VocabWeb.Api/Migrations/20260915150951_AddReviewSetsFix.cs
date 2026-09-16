using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewSetsFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassVocabularyReviewSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsVisible = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassVocabularyReviewSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassVocabularyReviewSets_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassVocabularyReviewSetUnits",
                columns: table => new
                {
                    ReviewSetId = table.Column<int>(type: "int", nullable: false),
                    ClassLessonId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassVocabularyReviewSetUnits", x => new { x.ReviewSetId, x.ClassLessonId });
                    table.ForeignKey(
                        name: "FK_ClassVocabularyReviewSetUnits_ClassLessons_ClassLessonId",
                        column: x => x.ClassLessonId,
                        principalTable: "ClassLessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassVocabularyReviewSetUnits_ClassVocabularyReviewSets_ReviewSetId",
                        column: x => x.ReviewSetId,
                        principalTable: "ClassVocabularyReviewSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassVocabularyReviewSets_ClassId",
                table: "ClassVocabularyReviewSets",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassVocabularyReviewSetUnits_ClassLessonId",
                table: "ClassVocabularyReviewSetUnits",
                column: "ClassLessonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassVocabularyReviewSetUnits");

            migrationBuilder.DropTable(
                name: "ClassVocabularyReviewSets");
        }
    }
}
