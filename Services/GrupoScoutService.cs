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
        public async Task<List<ResumenUnidadDto>> ObtenerResumenDeRegistrosPorUnidadAsync(int grupoId)
{
    var gestionActiva = await _context.Gestiones
        .FirstOrDefaultAsync(g => g.Activa);

    if (gestionActiva == null)
        throw new Exception("No hay gestión activa.");

    // 1. Obtener las unidades del grupo con sus usuarios
    var unidades = await _context.Unidades
        .Where(u => u.GrupoScoutId == grupoId)
        .Include(u => u.Users)
        .ToListAsync();

    // 2. Obtener registros aprobados de esa gestión
    var registros = await _context.RegistrosGestion
        .Where(r => r.GestionId == gestionActiva.Id && r.AprobadoGrupo)
        .ToListAsync();

    // 3. Crear resumen por unidad
    var resumen = new List<ResumenUnidadDto>();

    foreach (var unidad in unidades)
    {
        // Usuarios de la unidad que tienen registro aprobado
        var usuariosAprobados = unidad.Users
            .Where(u => registros.Any(r => r.UsuarioId == u.Id))
            .ToList();

        var scouts = usuariosAprobados.Where(u => u.Tipo == "Scout").ToList();
        var dirigentes = usuariosAprobados.Where(u => u.Tipo == "Dirigente").ToList();

        var cantScoutsHombres = scouts.Count(s => s.Genero?.ToUpper() == "MASCULINO" || s.Genero?.ToUpper() == "M");
        var cantScoutsMujeres = scouts.Count(s => s.Genero?.ToUpper() == "FEMENINO" || s.Genero?.ToUpper() == "F");
        var cantDirigentesHombres = dirigentes.Count(s => s.Genero?.ToUpper() == "MASCULINO" || s.Genero?.ToUpper() == "M");
        var cantDirigentesMujeres = dirigentes.Count(s => s.Genero?.ToUpper() == "FEMENINO" || s.Genero?.ToUpper() == "F");

        resumen.Add(new ResumenUnidadDto
        {
            Nombre = unidad.Nombre,
            Rama = unidad.Rama,
            CantScouts = scouts.Count,
            CantScoutsHombres = cantScoutsHombres,
            CantScoutsMujeres = cantScoutsMujeres,
            CantDirigentes = dirigentes.Count,
            CantDirigentesHombres = cantDirigentesHombres,
            CantDirigentesMujeres = cantDirigentesMujeres,
            Total = scouts.Count + dirigentes.Count
        });
    }

    return resumen;
}

        public async Task<List<ResumenUnidadDto>> ObtenerResumenDeenviadosPorUnidadAsync(int grupoId)
{
    var gestionActiva = await _context.Gestiones
        .FirstOrDefaultAsync(g => g.Activa);

    if (gestionActiva == null)
        throw new Exception("No hay gestión activa.");

    // 1. Obtener las unidades del grupo con sus usuarios
    var unidades = await _context.Unidades
        .Where(u => u.GrupoScoutId == grupoId)
        .Include(u => u.Users)
        .ToListAsync();

    // 2. Obtener registros aprobados de esa gestión
    var registros = await _context.RegistrosGestion
        .Where(r => r.GestionId == gestionActiva.Id && r.EnviadoADistrito)
        .ToListAsync();

    // 3. Crear resumen por unidad
    var resumen = new List<ResumenUnidadDto>();

    foreach (var unidad in unidades)
    {
        // Usuarios de la unidad que tienen registro aprobado
        var usuariosAprobados = unidad.Users
            .Where(u => registros.Any(r => r.UsuarioId == u.Id))
            .ToList();

        var scouts = usuariosAprobados.Where(u => u.Tipo == "Scout").ToList();
        var dirigentes = usuariosAprobados.Where(u => u.Tipo == "Dirigente").ToList();

        var cantScoutsHombres = scouts.Count(s => s.Genero?.ToUpper() == "MASCULINO" || s.Genero?.ToUpper() == "M");
        var cantScoutsMujeres = scouts.Count(s => s.Genero?.ToUpper() == "FEMENINO" || s.Genero?.ToUpper() == "F");
        var cantDirigentesHombres = dirigentes.Count(s => s.Genero?.ToUpper() == "MASCULINO" || s.Genero?.ToUpper() == "M");
        var cantDirigentesMujeres = dirigentes.Count(s => s.Genero?.ToUpper() == "FEMENINO" || s.Genero?.ToUpper() == "F");

        resumen.Add(new ResumenUnidadDto
        {
            Nombre = unidad.Nombre,
            Rama = unidad.Rama,
            CantScouts = scouts.Count,
            CantScoutsHombres = cantScoutsHombres,
            CantScoutsMujeres = cantScoutsMujeres,
            CantDirigentes = dirigentes.Count,
            CantDirigentesHombres = cantDirigentesHombres,
            CantDirigentesMujeres = cantDirigentesMujeres,
            Total = scouts.Count + dirigentes.Count
        });
    }

    return resumen;
}
    }
}
