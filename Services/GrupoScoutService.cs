using BackendScout.Dtos.Grupo;
using BackendScout.Models;
using BackendScout.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendScout.Services
{
    public class GrupoScoutService
    {
        private readonly AppDbContext _context;

        public GrupoScoutService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ResumenUnidadGrupoDto>> ObtenerResumenUnidadesPorGrupoAsync(string grupoId)
        {
            int grupoInt = int.Parse(grupoId);

            var unidades = await _context.Unidades
                .Where(u => u.GrupoScoutId == grupoInt)
                .Include(u => u.Users)
                .ToListAsync();

            var resumen = unidades.Select(u =>
            {
                var scouts = u.Users.Where(us => us.Tipo == "Scout").ToList();
                var dirigentes = u.Users.Where(us => us.Tipo == "Dirigente").ToList();

                return new ResumenUnidadGrupoDto
                {
                    UnidadId = u.Id,
                    Nombre = u.Nombre,
                    Rama = u.Rama,
                    CantDirigentes = dirigentes.Count(),
                    CantDirigentesHombres = dirigentes.Count(d => string.Equals(d.Genero, "Masculino", StringComparison.OrdinalIgnoreCase)),
                    CantDirigentesMujeres = dirigentes.Count(d => string.Equals(d.Genero, "Femenino", StringComparison.OrdinalIgnoreCase)),
                    CantScouts = scouts.Count(),
                    CantScoutsHombres = scouts.Count(s => string.Equals(s.Genero, "Masculino", StringComparison.OrdinalIgnoreCase)),
                    CantScoutsMujeres = scouts.Count(s => string.Equals(s.Genero, "Femenino", StringComparison.OrdinalIgnoreCase)),
                    Total = scouts.Count() + dirigentes.Count()
                };
            }).ToList();

            return resumen;
        }
    }
}
