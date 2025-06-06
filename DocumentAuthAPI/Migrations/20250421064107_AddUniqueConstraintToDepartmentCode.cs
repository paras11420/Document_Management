using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocumentAuthAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstraintToDepartmentCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Departments_Code",
                table: "Departments");
        }
    }
}
