using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendScout.Migrations
{
    /// <inheritdoc />
    public partial class AddGrupoScoutIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GrupoScoutId",
                table: "RegistrosGestion",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GrupoScoutId",
                table: "RegistrosGestion");
        }
    }
}
