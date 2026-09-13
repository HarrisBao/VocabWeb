using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTestAccessAndAttemptIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessCodeHash",
                table: "Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "Tests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxAttempts",
                table: "Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicCode",
                table: "Tests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "RequiresAccessCode",
                table: "Tests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "Tests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "TestAttempts",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "AttemptNumber",
                table: "TestAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "GuestDisplayName",
                table: "TestAttempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestSessionId",
                table: "TestAttempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantDisplayNameSnapshot",
                table: "TestAttempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "TestAttempts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessCodeHash",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "MaxAttempts",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "PublicCode",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "RequiresAccessCode",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "AttemptNumber",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "GuestDisplayName",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "GuestSessionId",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "ParticipantDisplayNameSnapshot",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "TestAttempts");

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "TestAttempts",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
