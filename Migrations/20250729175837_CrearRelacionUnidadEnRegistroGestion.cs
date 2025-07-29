using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendScout.Migrations
{
    public partial class CrearRelacionUnidadEnRegistroGestion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RegistrosGestion_UnidadId",
                table: "RegistrosGestion",
                column: "UnidadId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosGestion_Unidades_UnidadId",
                table: "RegistrosGestion",
                column: "UnidadId",
                principalTable: "Unidades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosGestion_Unidades_UnidadId",
                table: "RegistrosGestion");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosGestion_UnidadId",
                table: "RegistrosGestion");
        }
    }
}
