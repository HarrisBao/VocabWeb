using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTestAttemptPlannerAndSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityPlanJson",
                table: "TestAttempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeLimitSnapshotMinutes",
                table: "TestAttempts",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityPlanJson",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "TimeLimitSnapshotMinutes",
                table: "TestAttempts");
        }
    }
}
