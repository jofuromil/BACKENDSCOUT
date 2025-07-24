using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using BackendScout.Dtos.Objetivos;

namespace BackendScout.Services
{
    public class ObjetivoService
    {
        private readonly AppDbContext _context;

        public ObjetivoService(AppDbContext context)
        {
            _context = context;
        }

        // Nuevo método principal de filtrado por Rama y Nivel de Progresión
        private string Normalizar(string texto)
        {
            return new string(texto
                .Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray())
                .ToLowerInvariant();
        }

        public async Task<List<ObjetivoEducativo>> ObtenerPorRamaYNivel(string rama, string? nivelProgresion, string? area = null)
        {
            var objetivos = await _context.ObjetivosEducativos
                .Where(o => o.Rama.ToLower() == rama.ToLower())
                .OrderBy(o => o.Area)
                .ThenBy(o => o.NivelProgresion)
                .ThenBy(o => o.Descripcion)
                .ToListAsync();

            if (!string.IsNullOrEmpty(nivelProgresion))
            {
                objetivos = objetivos
                    .Where(o => o.NivelProgresion != null && o.NivelProgresion.ToLower() == nivelProgresion.ToLower())
                    .ToList();
            }

            if (!string.IsNullOrEmpty(area))
            {
                var areaNormalizada = Normalizar(area);
                objetivos = objetivos
                    .Where(o => o.Area != null && Normalizar(o.Area) == areaNormalizada)
                    .ToList();
            }

            return objetivos;
        }

        public async Task<ObjetivoSeleccionado> SeleccionarObjetivo(Guid usuarioId, Guid objetivoId)
        {
            var yaSeleccionado = await _context.ObjetivosSeleccionados
                .FirstOrDefaultAsync(x => x.UsuarioId == usuarioId && x.ObjetivoEducativoId == objetivoId);

            if (yaSeleccionado != null)
                throw new Exception("Este objetivo ya fue seleccionado por el usuario.");

            var nuevo = new ObjetivoSeleccionado
            {
                UsuarioId = usuarioId,
                ObjetivoEducativoId = objetivoId
            };

            await _context.ObjetivosSeleccionados.AddAsync(nuevo);
            await _context.SaveChangesAsync();

            return nuevo;
        }

        public async Task<bool> ValidarObjetivo(Guid dirigenteId, Guid seleccionId)
        {
            var seleccion = await _context.ObjetivosSeleccionados.FirstOrDefaultAsync(s => s.Id == seleccionId);
            if (seleccion == null)
                throw new Exception("Selección no encontrada.");

            var scout = await _context.Users.FirstOrDefaultAsync(u => u.Id == seleccion.UsuarioId);
            var dirigente = await _context.Users.FirstOrDefaultAsync(u => u.Id == dirigenteId);

            if (dirigente == null || dirigente.Tipo.ToLower() != "dirigente")
                throw new Exception("Solo los dirigentes pueden validar objetivos.");

            if (dirigente.UnidadId != scout.UnidadId)
                throw new Exception("El dirigente no pertenece a la misma unidad que el scout.");

            seleccion.Validado = true;
            seleccion.FechaValidacion = DateTime.UtcNow;
            seleccion.DirigenteValidadorId = dirigenteId;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<object>> HistorialDeObjetivos(Guid usuarioId, bool? soloValidados = null)
        {
            var query = _context.ObjetivosSeleccionados
                .Where(s => s.UsuarioId == usuarioId);

            if (soloValidados.HasValue)
            {
                query = query.Where(s => s.Validado == soloValidados.Value);
            }

            var historial = await _context.ObjetivosSeleccionados
                .Where(s => s.UsuarioId == usuarioId &&
                        (!soloValidados.HasValue || s.Validado == soloValidados.Value))
                .Include(s => s.ObjetivoEducativo)
                .Include(s => s.DirigenteValidador)
                .Select(s => new
                {
                    Id = s.ObjetivoEducativo.Id,
                    Area = s.ObjetivoEducativo.Area,
                    Descripcion = s.ObjetivoEducativo.Descripcion,
                    NivelProgresion = s.ObjetivoEducativo.NivelProgresion,
                    Rama = s.ObjetivoEducativo.Rama,
                    FechaSeleccion = s.FechaSeleccion,
                    Validado = s.Validado,
                    FechaValidacion = s.FechaValidacion,
                    DirigenteValidador = s.DirigenteValidador != null ? s.DirigenteValidador.NombreCompleto : null
                })
                .OrderBy(o => o.FechaSeleccion)
                .ToListAsync();

            return historial.Cast<object>().ToList();
        }

        public async Task<List<User>> ObtenerScoutsConObjetivosPendientes(Guid dirigenteId)
        {
            var dirigente = await _context.Users.FindAsync(dirigenteId);
            if (dirigente == null || dirigente.Tipo.ToLower() != "dirigente")
                throw new Exception("Solo un dirigente puede ver objetivos pendientes.");

            if (dirigente.UnidadId == null)
                throw new Exception("Este dirigente no está asociado a ninguna unidad.");

            var scouts = await _context.ObjetivosSeleccionados
                .Where(o => o.Validado == false && o.Usuario.UnidadId == dirigente.UnidadId)
                .Select(o => o.Usuario)
                .Distinct()
                .ToListAsync();

            return scouts;
        }

        public async Task<List<User>> ObtenerUsuariosConPendientes()
        {
            return await _context.ObjetivosSeleccionados
                .Where(o => !o.Validado)
                .Select(o => o.Usuario)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<ObjetivoSeleccionado>> ObjetivosPendientesPorUsuario(Guid usuarioId)
        {
            return await _context.ObjetivosSeleccionados
                .Where(os => os.UsuarioId == usuarioId && !os.Validado)
                .Include(os => os.ObjetivoEducativo)
                .ToListAsync();
        }

        public async Task<List<object>> ObtenerPendientesPorDirigente(Guid dirigenteId)
        {
            var dirigente = await _context.Users.FirstOrDefaultAsync(u => u.Id == dirigenteId);

            if (dirigente == null || dirigente.Tipo.ToLower() != "dirigente")
                throw new Exception("El usuario no es un dirigente válido.");

            if (dirigente.UnidadId == null)
                throw new Exception("Este dirigente no está asignado a ninguna unidad.");

            var pendientes = await _context.ObjetivosSeleccionados
                .Where(s => !s.Validado && s.Usuario.UnidadId == dirigente.UnidadId)
                .Include(s => s.Usuario)
                .Include(s => s.ObjetivoEducativo)
                .Select(s => new
                {
                    Scout = s.Usuario.NombreCompleto,
                    Rama = s.Usuario.Rama,
                    Objetivo = s.ObjetivoEducativo.Descripcion,
                    FechaSeleccion = s.FechaSeleccion,
                    IdSeleccion = s.Id
                })
                .ToListAsync();

            return pendientes.Cast<object>().ToList();
        }

        public async Task<List<ObjetivoSeleccionado>> ObtenerPendientesPorScout(Guid usuarioId)
        {
            return await _context.ObjetivosSeleccionados
                .Include(o => o.ObjetivoEducativo)
                .Where(o => o.UsuarioId == usuarioId && !o.Validado)
                .ToListAsync();
        }
        public async Task<List<object>> ObtenerResumenPorScout(Guid usuarioId)
        {
            var objetivos = await _context.ObjetivosSeleccionados
                .Where(o => o.UsuarioId == usuarioId)
                .Include(o => o.ObjetivoEducativo)
                .ToListAsync();

            var resumen = objetivos
                .Where(o => o.ObjetivoEducativo != null)
                .GroupBy(o => new
                {
                    Area = o.ObjetivoEducativo.Area,
                    Nivel = o.ObjetivoEducativo.NivelProgresion
                })
                .Select(g => new
                {
                    areaCrecimiento = g.Key.Area,
                    nivelProgresion = g.Key.Nivel,
                    total = g.Count(),
                    validados = g.Count(o => o.Validado),
                    pendientes = g.Count(o => !o.Validado)
                })
                .OrderBy(r => r.nivelProgresion)
                .ThenBy(r => r.areaCrecimiento)
                .ToList();

            return resumen.Cast<object>().ToList();
        }
        public async Task<List<ObjetivoPendienteDto>> ObtenerPendientesDtoPorScout(Guid usuarioId)
        {
            var pendientes = await _context.ObjetivosSeleccionados
                .Where(o => o.UsuarioId == usuarioId && !o.Validado)
                .Include(o => o.ObjetivoEducativo)
                .Select(o => new ObjetivoPendienteDto
                {
                    Descripcion = o.ObjetivoEducativo.Descripcion,
                    AreaCrecimiento = o.ObjetivoEducativo.Area,
                    FechaSeleccion = o.FechaSeleccion
                })
                .ToListAsync();

            return pendientes;
        }
        public async Task<List<ObjetivoUnidadPendienteDto>> ObtenerPendientesPorUnidadDto(Guid dirigenteId)
        {
            var dirigente = await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == dirigenteId);

            if (dirigente == null || dirigente.UnidadId == null)
                throw new Exception("El dirigente no está asignado a una unidad.");

            var pendientes = await _context.ObjetivosSeleccionados
                .Where(o => o.Usuario.UnidadId == dirigente.UnidadId && !o.Validado)
                .Include(o => o.ObjetivoEducativo)
                .Include(o => o.Usuario)
                .Select(o => new ObjetivoUnidadPendienteDto
                {
                    IdSeleccion = o.Id,
                    NombreScout = o.Usuario.NombreCompleto,
                    Rama = o.Usuario.Rama,
                    Descripcion = o.ObjetivoEducativo.Descripcion,
                    AreaCrecimiento = o.ObjetivoEducativo.Area,
                    NivelProgresion = o.ObjetivoEducativo.NivelProgresion,
                    FechaSeleccion = o.FechaSeleccion
                })
                .ToListAsync();

            return pendientes;
        }       

    }
}
