using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendScout.Migrations
{
    /// <inheritdoc />
    public partial class AgregarUnidadIdSinRelacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UnidadId",
                table: "RegistrosGestion",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnidadId",
                table: "RegistrosGestion");
        }
    }
}
