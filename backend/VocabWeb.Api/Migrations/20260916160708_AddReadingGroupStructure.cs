using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReadingGroupStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AcademicQuestionType",
                table: "ReadingQuestionGroups",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AllowedAnswerDomain",
                table: "ReadingQuestionGroups",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayLabel",
                table: "ReadingQuestionGroups",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceItems",
                table: "ReadingQuestionGroups",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StructuredContent",
                table: "ReadingQuestionGroups",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcademicQuestionType",
                table: "ReadingQuestionGroups");

            migrationBuilder.DropColumn(
                name: "AllowedAnswerDomain",
                table: "ReadingQuestionGroups");

            migrationBuilder.DropColumn(
                name: "DisplayLabel",
                table: "ReadingQuestionGroups");

            migrationBuilder.DropColumn(
                name: "ReferenceItems",
                table: "ReadingQuestionGroups");

            migrationBuilder.DropColumn(
                name: "StructuredContent",
                table: "ReadingQuestionGroups");
        }
    }
}
