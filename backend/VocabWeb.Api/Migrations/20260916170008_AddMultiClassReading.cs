using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiClassReading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReadingAssignments_Classes_ClassId",
                table: "ReadingAssignments");

            migrationBuilder.AddColumn<int>(
                name: "AllowedDurationSecondsSnapshot",
                table: "ReadingAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OvertimeSeconds",
                table: "ReadingAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "ClassId",
                table: "ReadingAssignments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "ReadingClassAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReadingAssignmentId = table.Column<int>(type: "int", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingClassAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingClassAssignments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReadingClassAssignments_ReadingAssignments_ReadingAssignmentId",
                        column: x => x.ReadingAssignmentId,
                        principalTable: "ReadingAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingClassAssignments_ClassId",
                table: "ReadingClassAssignments",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingClassAssignments_ReadingAssignmentId",
                table: "ReadingClassAssignments",
                column: "ReadingAssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingAssignments_Classes_ClassId",
                table: "ReadingAssignments",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReadingAssignments_Classes_ClassId",
                table: "ReadingAssignments");

            migrationBuilder.DropTable(
                name: "ReadingClassAssignments");

            migrationBuilder.DropColumn(
                name: "AllowedDurationSecondsSnapshot",
                table: "ReadingAttempts");

            migrationBuilder.DropColumn(
                name: "OvertimeSeconds",
                table: "ReadingAttempts");

            migrationBuilder.AlterColumn<int>(
                name: "ClassId",
                table: "ReadingAssignments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingAssignments_Classes_ClassId",
                table: "ReadingAssignments",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
