using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendScout.Dtos;

namespace BackendScout.Services
{
    public class NacionalService
    {
        private readonly AppDbContext _context;

        public NacionalService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Guid?> GetGestionActivaIdAsync()
        {
            return await _context.Gestiones
                .Where(g => g.EstaActiva)
                .Select(g => (Guid?)g.Id)
                .FirstOrDefaultAsync();
        }

        // ====== Roles ======
        public async Task<bool> EsAdminNacionalAsync(Guid usuarioId)
        {
            return await _context.RolesNacionales
                .AnyAsync(r => r.UsuarioId == usuarioId && r.Rol == "AdminNacional" && r.Activo);
        }

        public async Task<bool> AsignarAdminNacionalAsync(Guid usuarioId)
        {
            var yaEs = await EsAdminNacionalAsync(usuarioId);
            if (yaEs) return true;

            _context.RolesNacionales.Add(new RolNacionalUsuario
            {
                UsuarioId = usuarioId,
                Rol = "AdminNacional",
                Activo = true,
                FechaAsignacion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true;
        }

        // ====== Pendientes y aprobaciones ======
        public async Task<List<RegistroGestion>> ObtenerPendientesAsync()
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return new List<RegistroGestion>();

            return await _context.RegistrosGestion
                .AsNoTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r =>
                    r.GestionId == gestionId.Value &&
                    r.EnviadoANacional &&
                    !r.AprobadoNacional)
                .ToListAsync();
        }

        public async Task<bool> AprobarNacionalIndividualAsync(Guid usuarioId)
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return false;

            var reg = await _context.RegistrosGestion
                .AsTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r =>
                    r.GestionId == gestionId.Value &&
                    r.UsuarioId == usuarioId &&
                    r.EnviadoANacional &&
                    r.AprobadoDistrito &&
                    !r.AprobadoNacional)
                .OrderByDescending(r => r.FechaAprobadoDistrito ?? DateTime.MinValue)
                .FirstOrDefaultAsync();

            if (reg == null) return false;

            var u = reg.Usuario;

            // Marcar aprobado nacional y "congelar" datos estáticos del usuario
            reg.AprobadoNacional = true;
            reg.FechaAprobadoNacional = DateTime.UtcNow;

            reg.NombreCompleto = u.NombreCompleto;
            reg.CI = u.CI;
            reg.FechaNacimiento = u.FechaNacimiento;
            reg.Rama = u.Rama;
            reg.UnidadNombre = u.Unidad?.Nombre;
            reg.GrupoNombre = u.Unidad?.GrupoScout?.Nombre;
            reg.DistritoNombre = u.Unidad?.GrupoScout?.NivelDistrito?.Nombre;
            if (u.UnidadId.HasValue) reg.UnidadId = u.UnidadId.Value;
            reg.GrupoScoutId = u.Unidad?.GrupoScoutId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> AprobarTodosPendientesAsync()
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return 0;

            var regs = await _context.RegistrosGestion
                .AsTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r =>
                    r.GestionId == gestionId.Value &&
                    r.EnviadoANacional &&
                    r.AprobadoDistrito &&
                    !r.AprobadoNacional)
                .ToListAsync();

            foreach (var reg in regs)
            {
                var u = reg.Usuario;

                reg.AprobadoNacional = true;
                reg.FechaAprobadoNacional = DateTime.UtcNow;

                reg.NombreCompleto = u.NombreCompleto;
                reg.CI = u.CI;
                reg.FechaNacimiento = u.FechaNacimiento;
                reg.Rama = u.Rama;
                reg.UnidadNombre = u.Unidad?.Nombre;
                reg.GrupoNombre = u.Unidad?.GrupoScout?.Nombre;
                reg.DistritoNombre = u.Unidad?.GrupoScout?.NivelDistrito?.Nombre;
                if (u.UnidadId.HasValue) reg.UnidadId = u.UnidadId.Value;
                reg.GrupoScoutId = u.Unidad?.GrupoScoutId;
            }

            await _context.SaveChangesAsync();
            return regs.Count;
        }
        public async Task<NacionalResumenDto> ObtenerResumenAsync()
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return new NacionalResumenDto();

            // Traemos TODO lo relevante de la gestión activa
            var regs = await _context.RegistrosGestion
                .AsNoTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r => r.GestionId == gestionId.Value)
                .ToListAsync();

            var dto = new NacionalResumenDto
            {
                TotalEnviados = regs.Count(r => r.EnviadoANacional),
                TotalPendientes = regs.Count(r => r.EnviadoANacional && !r.AprobadoNacional),
                TotalAprobados = regs.Count(r => r.AprobadoNacional),
            };

            // Helper local para normalizar rama
            string RamaNorm(RegistroGestion r)
            {
                // Preferimos la del usuario (pendientes) o la del registro (aprobados)
                var rama = r.AprobadoNacional ? r.Rama : r.Usuario?.Rama;
                rama = rama?.Trim().ToLowerInvariant();
                return rama ?? "";
            }
            void SumRama(NacionalResumenRamasDto target, string rama)
            {
                switch (rama)
                {
                    case "lobatos": target.Lobatos++; break;
                    case "exploradores": target.Exploradores++; break;
                    case "pioneros": target.Pioneros++; break;
                    case "rovers": target.Rovers++; break;
                    case "dirigente":
                    case "dirigentes": target.Dirigentes++; break;
                }
            }

            foreach (var r in regs.Where(x => x.EnviadoANacional && !x.AprobadoNacional))
                SumRama(dto.PendientesPorRama, RamaNorm(r));

            foreach (var r in regs.Where(x => x.AprobadoNacional))
                SumRama(dto.AprobadosPorRama, RamaNorm(r));

            // Por distrito
            dto.PorDistrito = regs
                .GroupBy(r => new
                {
                    Id = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Id,
                    Nombre = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Nombre
                })
                .Select(g => new NacionalResumenDistritoDto
                {
                    DistritoId = g.Key.Id,
                    DistritoNombre = g.Key.Nombre,
                    Enviados = g.Count(x => x.EnviadoANacional),
                    Pendientes = g.Count(x => x.EnviadoANacional && !x.AprobadoNacional),
                    Aprobados = g.Count(x => x.AprobadoNacional)
                })
                .OrderBy(x => x.DistritoNombre)
                .ToList();

            return dto;
        }
        // Resumen por distrito (enviados / aprobados / pendientes) en la gestión activa
        public async Task<List<NacionalResumenDistritoDto>> ObtenerResumenPendientesPorDistritoAsync()
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return new List<NacionalResumenDistritoDto>();

            var regs = await _context.RegistrosGestion
                .AsNoTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r => r.GestionId == gestionId.Value)
                .ToListAsync();

            return regs
                .GroupBy(r => new
                {
                    Id = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Id,
                    Nombre = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Nombre
                })
                .Select(g => new NacionalResumenDistritoDto
                {
                    DistritoId = g.Key.Id,
                    DistritoNombre = g.Key.Nombre ?? "—",
                    Enviados = g.Count(x => x.EnviadoANacional),
                    Aprobados = g.Count(x => x.AprobadoNacional),
                    Pendientes = g.Count(x => x.EnviadoANacional && !x.AprobadoNacional)
                })
                .OrderBy(d => d.DistritoNombre)
                .ToList();
        }

        // Pendientes por distrito (gestión activa)
        public async Task<List<RegistroGestion>> ObtenerPendientesPorDistritoAsync(int distritoId)
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return new List<RegistroGestion>();

            return await _context.RegistrosGestion
                .AsNoTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r =>
                    r.GestionId == gestionId.Value &&
                    r.EnviadoANacional &&
                    !r.AprobadoNacional &&
                    r.Usuario.Unidad.GrupoScout.NivelDistrito.Id == distritoId)
                .ToListAsync();
        }

        // Aprobar TODOS los pendientes de un distrito (gestión activa)
        public async Task<int> AprobarTodosPendientesPorDistritoAsync(int distritoId)
        {
            var gestionId = await GetGestionActivaIdAsync();
            if (gestionId == null) return 0;

            var regs = await _context.RegistrosGestion
                .AsTracking()
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                        .ThenInclude(un => un.GrupoScout)
                            .ThenInclude(gs => gs.NivelDistrito)
                .Where(r =>
                    r.GestionId == gestionId.Value &&
                    r.EnviadoANacional &&
                    r.AprobadoDistrito &&
                    !r.AprobadoNacional &&
                    r.Usuario.Unidad.GrupoScout.NivelDistrito.Id == distritoId)
                .ToListAsync();

            foreach (var reg in regs)
            {
                var u = reg.Usuario;

                reg.AprobadoNacional = true;
                reg.FechaAprobadoNacional = DateTime.UtcNow;

                // "Congelar" datos
                reg.NombreCompleto = u.NombreCompleto;
                reg.CI = u.CI;
                reg.FechaNacimiento = u.FechaNacimiento;
                reg.Rama = u.Rama;
                reg.UnidadNombre = u.Unidad?.Nombre;
                reg.GrupoNombre = u.Unidad?.GrupoScout?.Nombre;
                reg.DistritoNombre = u.Unidad?.GrupoScout?.NivelDistrito?.Nombre;
                if (u.UnidadId.HasValue) reg.UnidadId = u.UnidadId.Value;
                reg.GrupoScoutId = u.Unidad?.GrupoScoutId;
            }

            await _context.SaveChangesAsync();
            return regs.Count;
        }
    }
}
