using BackendScout.Data;
using BackendScout.Dtos;
using Microsoft.EntityFrameworkCore;
using BackendScout.Models;


namespace BackendScout.Services
{
    public class DistritoResumenService
    {
        private readonly AppDbContext _context;

        public DistritoResumenService(AppDbContext context)
        {
            _context = context;
        }

        // --------------------------------------------------------------------
        // 1) IDs de usuarios aprobados por el nivel distrital
        // --------------------------------------------------------------------
        private IQueryable<Guid> UsuariosAprobadosPorDistritoIds(int distritoId)
        {
            // Filtra por AprobadoDistrito y por el distrito de la Unidad (navegación)
            var ids =
                _context.Set<RegistroGestion>()
                    .AsNoTracking()
                    .Include(r => r.Unidad)
                        .ThenInclude(u => u.NivelDistrito)
                    .Where(r =>
                        r.Unidad != null &&
                        r.Unidad.NivelDistrito != null &&
                        r.Unidad.NivelDistrito.Id == distritoId &&
                        r.AprobadoDistrito)                 // <-- tu campo real
                    .Select(r => r.UsuarioId)               // <-- tu campo real
                    .Distinct();

            return ids;
        }
        // --------------------------------------------------------------------
        // 2) Acumulador por rama / género
        // --------------------------------------------------------------------
        private static void Acumular(RamaCountDto bolsa, string tipo, string? rama, string? genero)
        {
            var gen = (genero ?? "").Trim();
            bool esM = gen.Equals("M", StringComparison.OrdinalIgnoreCase) ||
                       gen.Equals("Masculino", StringComparison.OrdinalIgnoreCase);

            // DIRIGENTES van por tipo
            if (tipo.Equals("Dirigente", StringComparison.OrdinalIgnoreCase))
            {
                if (esM) bolsa.DIR.M++; else bolsa.DIR.F++;
                return;
            }

            var r = (rama ?? "").Trim().ToUpperInvariant();
            if (r == "LOBATOS") { if (esM) bolsa.LOB.M++; else bolsa.LOB.F++; }
            else if (r == "EXPLORADORES") { if (esM) bolsa.EXP.M++; else bolsa.EXP.F++; }
            else if (r == "PIONEROS") { if (esM) bolsa.PIO.M++; else bolsa.PIO.F++; }
            else if (r == "ROVERS") { if (esM) bolsa.ROV.M++; else bolsa.ROV.F++; }
        }

        // --------------------------------------------------------------------
        // 3) Resumen principal
        // --------------------------------------------------------------------
        public async Task<ResumenDistritoDto> ObtenerResumenAsync(int distritoId)
        {
            // Nombre del distrito
            var distrito = await _context.NivelesDistrito
                                         .AsNoTracking()
                                         .FirstOrDefaultAsync(d => d.Id == distritoId);

            var dto = new ResumenDistritoDto
            {
                DistritoId = distritoId,
                DistritoNombre = distrito?.Nombre ?? ""
            };

            // Solo usuarios aprobados por el distrito
            var aprobadosIds = UsuariosAprobadosPorDistritoIds(distritoId);

            // Base: Usuario -> Unidad -> Grupo (filtrando por distrito del grupo)
            var baseQuery =
                _context.Users
                    .AsNoTracking()
                    .Include(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                    .Include(u => u.Unidad)
                        .ThenInclude(un => un.NivelDistrito)
                    .Where(u =>
                        u.Unidad != null &&
                        u.Unidad.NivelDistrito != null &&
                        u.Unidad.NivelDistrito.Id == distritoId)   // <-- distrito por Unidad
                    .Where(u => aprobadosIds.Contains(u.Id))
                    .Select(u => new
                    {
                        u.Id,
                        u.Tipo,
                        u.Rama,
                        u.Genero,
                        GrupoId = u.Unidad!.GrupoScout!.Id,
                        GrupoNombre = u.Unidad!.GrupoScout!.Nombre,
                        UnidadId = u.Unidad!.Id,
                        UnidadNombre = u.Unidad!.Nombre
                    });
            // Traemos la base a memoria para agrupar sin líos de nombres
            var items = await baseQuery.ToListAsync();

            // Agrupamos en memoria con nombres explícitos
            var porGrupo = items
                .GroupBy(x => new { x.GrupoId, x.GrupoNombre })
                .Select(grp => new
                {
                    GrupoId = grp.Key.GrupoId,
                    GrupoNombre = grp.Key.GrupoNombre,
                    Unidades = grp
                        .GroupBy(x => new { x.UnidadId, x.UnidadNombre })
                        .Select(un => new
                        {
                            UnidadId = un.Key.UnidadId,
                            UnidadNombre = un.Key.UnidadNombre,
                            Personas = un.Select(p => new { p.Tipo, p.Rama, p.Genero }).ToList()
                        })
                        .ToList(),
                    Todos = grp.Select(p => new { p.Tipo, p.Rama, p.Genero }).ToList()
                })
                .OrderBy(x => x.GrupoNombre)
                .ToList();

            // Construcción del DTO final
            foreach (var g in porGrupo)
            {
                var grupoDto = new BackendScout.Dtos.GrupoResumenDto
                {
                    GrupoScoutId = g.GrupoId,
                    GrupoScoutNombre = g.GrupoNombre ?? string.Empty,
                    NumeroUnidades = g.Unidades?.Count ?? 0
                };

                // Totales por grupo
                foreach (var item in g.Todos)
                    Acumular(grupoDto.TotalesGrupo, item.Tipo, item.Rama, item.Genero);

                // Filas por unidad
                if (g.Unidades != null)
                {
                    foreach (var u in g.Unidades.OrderBy(u => u.UnidadNombre ?? ""))
                    {
                        var uDto = new UnidadRamaCountDto
                        {
                            UnidadId = u.UnidadId,
                            UnidadNombre = string.IsNullOrWhiteSpace(u.UnidadNombre) ? "Unidad" : u.UnidadNombre
                        };

                        foreach (var item in u.Personas)
                            Acumular(uDto.Conteo, item.Tipo, item.Rama, item.Genero);

                        grupoDto.Unidades.Add(uDto);
                    }
                }

                // Acumular al total de distrito
                dto.Grupos.Add(grupoDto);
                dto.TotalesDistrito.LOB.M += grupoDto.TotalesGrupo.LOB.M;
                dto.TotalesDistrito.LOB.F += grupoDto.TotalesGrupo.LOB.F;
                dto.TotalesDistrito.EXP.M += grupoDto.TotalesGrupo.EXP.M;
                dto.TotalesDistrito.EXP.F += grupoDto.TotalesGrupo.EXP.F;
                dto.TotalesDistrito.PIO.M += grupoDto.TotalesGrupo.PIO.M;
                dto.TotalesDistrito.PIO.F += grupoDto.TotalesGrupo.PIO.F;
                dto.TotalesDistrito.ROV.M += grupoDto.TotalesGrupo.ROV.M;
                dto.TotalesDistrito.ROV.F += grupoDto.TotalesGrupo.ROV.F;
                dto.TotalesDistrito.DIR.M += grupoDto.TotalesGrupo.DIR.M;
                dto.TotalesDistrito.DIR.F += grupoDto.TotalesGrupo.DIR.F;
            }

            return dto;
        }
        // Helper local para formatear el CI
private static string? BuildCarnet(string? ci, string? comp)
{
    if (string.IsNullOrWhiteSpace(ci)) return null;
    return string.IsNullOrWhiteSpace(comp) ? ci : $"{ci}-{comp}";
}

        public async Task<ListasDistritoDto> ObtenerListasAsync(int distritoId)
        {
            // Nombre del distrito
            var distrito = await _context.NivelesDistrito
                                         .AsNoTracking()
                                         .FirstOrDefaultAsync(d => d.Id == distritoId);

            var dto = new ListasDistritoDto
            {
                DistritoId = distritoId,
                DistritoNombre = distrito?.Nombre ?? ""
            };

            // IDs aprobados por el distrito (método que ya tienes en este service)
            var aprobadosIds = UsuariosAprobadosPorDistritoIds(distritoId);

            // Traemos usuarios aprobados con su Unidad/Grupo (del mismo distrito)
            var items = await _context.Users
                .AsNoTracking()
                .Include(u => u.Unidad)
                    .ThenInclude(un => un.GrupoScout)
                .Include(u => u.Unidad)
                    .ThenInclude(un => un.NivelDistrito)
                .Where(u => u.Unidad != null &&
                            u.Unidad.NivelDistrito != null &&
                            u.Unidad.NivelDistrito.Id == distritoId)
                .Where(u => aprobadosIds.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.FechaNacimiento,              // DateTime (no nulo en tu modelo)
                    Sexo = u.Genero,                // "Masculino" / "Femenino"
                    u.Tipo,                         // "Scout" o "Dirigente"
                    u.Rama,                         // Rama del usuario
                    GrupoId = u.Unidad!.GrupoScout!.Id,
                    GrupoNombre = u.Unidad!.GrupoScout!.Nombre,
                    UnidadId = u.Unidad!.Id,
                    UnidadNombre = u.Unidad!.Nombre,

                    // Campos de ficha personal
                    u.CI,
                    u.ComplementoCI,
                    Colegio = u.InstitucionEducativa,
                    Curso = u.NivelEstudios,
                    u.Profesion,
                    u.Ocupacion
                })
                .ToListAsync();

            // --------- SCOUTS: agrupado por Grupo -> Unidad (con rama) ----------
            var soloScouts = items
                .Where(x => !string.Equals(x.Tipo, "Dirigente", StringComparison.OrdinalIgnoreCase))
                .ToList();

            var grupos = soloScouts
                .GroupBy(x => new { x.GrupoId, x.GrupoNombre })
                .OrderBy(g => g.Key.GrupoNombre);

            foreach (var g in grupos)
            {
                var gDto = new GrupoListasDto
                {
                    GrupoScoutId = g.Key.GrupoId,
                    GrupoScoutNombre = g.Key.GrupoNombre ?? ""
                };

                var unidades = g.GroupBy(x => new { x.UnidadId, x.UnidadNombre, x.Rama })
                                .OrderBy(u => u.Key.UnidadNombre);

                foreach (var u in unidades)
                {
                    var uDto = new UnidadListaDto
                    {
                        UnidadId = u.Key.UnidadId,
                        UnidadNombre = u.Key.UnidadNombre ?? "Unidad",
                        Rama = u.Key.Rama
                    };

                    foreach (var p in u.OrderBy(x => x.NombreCompleto))
                    {
                        uDto.Scouts.Add(new ScoutListaItemDto
                        {
                            UserId = p.Id,
                            NombreCompleto = p.NombreCompleto ?? "",
                            CarnetIdentidad = BuildCarnet(p.CI, p.ComplementoCI),
                            FechaNacimiento = p.FechaNacimiento, // DTO es Nullable, el modelo no: OK
                            Sexo = p.Sexo,
                            Colegio = p.Colegio,
                            Curso = p.Curso
                        });
                    }

                    gDto.Unidades.Add(uDto);
                }

                dto.Grupos.Add(gDto);
            }

            // --------- DIRIGENTES: listado final para todo el distrito ----------
            var dirs = items
                .Where(x => string.Equals(x.Tipo, "Dirigente", StringComparison.OrdinalIgnoreCase))
                .OrderBy(x => x.GrupoNombre)
                .ThenBy(x => x.NombreCompleto);

            foreach (var d in dirs)
            {
                dto.Dirigentes.Add(new DirigenteListaItemDto
                {
                    UserId = d.Id,
                    NombreCompleto = d.NombreCompleto ?? "",
                    CarnetIdentidad = BuildCarnet(d.CI, d.ComplementoCI),
                    FechaNacimiento = d.FechaNacimiento,
                    Sexo = d.Sexo,
                    Profesion = d.Profesion,
                    Ocupacion = d.Ocupacion,
                    GrupoScoutId = d.GrupoId,
                    GrupoScoutNombre = d.GrupoNombre ?? ""
                });
            }

            return dto;
        }
    }
}
