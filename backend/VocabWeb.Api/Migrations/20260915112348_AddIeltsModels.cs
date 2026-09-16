using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocabWeb.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIeltsModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ResultScale",
                table: "Tests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Skill",
                table: "Classes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "IeltsMockExams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeacherId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IeltsMockExams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IeltsMockExams_AspNetUsers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IeltsMockExams_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WritingFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    TaskName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskResponse = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CoherenceCohesion = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LexicalResource = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GrammaticalRange = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OverallBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GoodPoints = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NeedsImprovement = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TeacherComment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextSteps = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingFeedbacks_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WritingFeedbacks_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IeltsMockExamResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IeltsMockExamId = table.Column<int>(type: "int", nullable: false),
                    StudentProfileId = table.Column<int>(type: "int", nullable: false),
                    ListeningBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ReadingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WritingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SpeakingBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RawAverage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OverallBand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IeltsMockExamResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IeltsMockExamResults_IeltsMockExams_IeltsMockExamId",
                        column: x => x.IeltsMockExamId,
                        principalTable: "IeltsMockExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IeltsMockExamResults_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExamResults_IeltsMockExamId",
                table: "IeltsMockExamResults",
                column: "IeltsMockExamId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExamResults_StudentProfileId",
                table: "IeltsMockExamResults",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExams_ClassId",
                table: "IeltsMockExams",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_IeltsMockExams_TeacherId",
                table: "IeltsMockExams",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingFeedbacks_ClassId",
                table: "WritingFeedbacks",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingFeedbacks_StudentProfileId",
                table: "WritingFeedbacks",
                column: "StudentProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IeltsMockExamResults");

            migrationBuilder.DropTable(
                name: "WritingFeedbacks");

            migrationBuilder.DropTable(
                name: "IeltsMockExams");

            migrationBuilder.DropColumn(
                name: "ResultScale",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "Skill",
                table: "Classes");
        }
    }
}
