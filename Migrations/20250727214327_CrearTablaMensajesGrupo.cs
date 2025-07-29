using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendScout.Migrations
{
    /// <inheritdoc />
    public partial class CrearTablaMensajesGrupo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MensajesGrupo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    GrupoScoutId = table.Column<int>(type: "INTEGER", nullable: false),
                    RemitenteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Contenido = table.Column<string>(type: "TEXT", nullable: false),
                    UrlArchivo = table.Column<string>(type: "TEXT", nullable: true),
                    UrlImagen = table.Column<string>(type: "TEXT", nullable: true),
                    Destinatarios = table.Column<string>(type: "TEXT", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensajesGrupo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensajesGrupo_GruposScout_GrupoScoutId",
                        column: x => x.GrupoScoutId,
                        principalTable: "GruposScout",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MensajesGrupo_Users_RemitenteId",
                        column: x => x.RemitenteId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MensajesGrupo_GrupoScoutId",
                table: "MensajesGrupo",
                column: "GrupoScoutId");

            migrationBuilder.CreateIndex(
                name: "IX_MensajesGrupo_RemitenteId",
                table: "MensajesGrupo",
                column: "RemitenteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MensajesGrupo");
        }
    }
}
