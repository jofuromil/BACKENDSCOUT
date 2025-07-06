using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;
using BackendScout.DTOs;

namespace BackendScout.Services
{
    public class RegistroGestionService
    {
        private readonly AppDbContext _context;

        public RegistroGestionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<RegistroGestion>> ObtenerRegistrosGrupoAsync(int grupoId)
        {
            return await _context.RegistrosGestion
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Unidad)
                .Include(r => r.Gestion)
                .Where(r => r.Usuario.GrupoScoutUsuarios.Any(g => g.GrupoScoutId == grupoId))
                .ToListAsync();
        }
        public async Task RegistrarUsuarioEnGestionAsync(Guid usuarioId, Guid gestionId)
        {
            var registro = await _context.RegistrosGestion
                .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId && r.GestionId == gestionId);

            if (registro == null)
            {
                var nuevoRegistro = new RegistroGestion
                {
                    Id = Guid.NewGuid(),
                    UsuarioId = usuarioId,
                    GestionId = gestionId,
                    AprobadoGrupo = true,
                    FechaAprobadoGrupo = DateTime.UtcNow
                };

                _context.RegistrosGestion.Add(nuevoRegistro);
            }
            else if (!registro.AprobadoGrupo)
            {
                registro.AprobadoGrupo = true;
                registro.FechaAprobadoGrupo = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task QuitarRegistroDeUsuarioAsync(Guid usuarioId, Guid gestionId)
        {
            var registro = await _context.RegistrosGestion
                .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId && r.GestionId == gestionId);

            if (registro != null)
            {
                registro.AprobadoGrupo = false;
                registro.FechaAprobadoGrupo = null;
                await _context.SaveChangesAsync();
            }
        }

        public async Task EnviarRegistroADistritoAsync(Guid usuarioId, Guid gestionId)
        {
            var registro = await _context.RegistrosGestion
                .Include(r => r.Usuario)
                .ThenInclude(u => u.Unidad)
                .ThenInclude(u => u.GrupoScout)
                .FirstOrDefaultAsync(r =>
                    r.UsuarioId == usuarioId && r.GestionId == gestionId);

            if (registro == null)
                throw new Exception("El usuario no está registrado en esta gestión.");

            if (!registro.AprobadoGrupo)
                throw new Exception("El usuario aún no ha sido aprobado por el grupo.");

            var usuario = registro.Usuario;

            // Validación de datos obligatorios
            if (string.IsNullOrWhiteSpace(usuario.CI) ||
                usuario.FechaNacimiento == default ||
                string.IsNullOrWhiteSpace(usuario.Rama) ||
                usuario.Unidad == null ||
                usuario.Unidad.GrupoScout == null)
            {
                throw new Exception("El usuario no tiene todos los datos obligatorios completos.");
            }

            // Marcar como enviado
            registro.EnviadoADistrito = true;
            registro.FechaEnvioDistrito = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
        public async Task<List<User>> ObtenerUsuariosRegistradosPorGestion(int grupoId, int gestion)
        {
            return await _context.RegistrosGestion
                .Where(rg => rg.Usuario.GrupoScoutUsuarios.Any(g => g.GrupoScoutId == grupoId)
                        && rg.Gestion.Nombre == gestion.ToString())
                .Select(rg => rg.Usuario)
                .Distinct()
                .Include(u => u.Unidad)
                .ToListAsync();
        }

        public async Task<List<User>> ObtenerUsuariosRegistradosAsync(int grupoId, Guid gestionId)
        {
            var idsRegistrados = await _context.RegistrosGestion
                .Where(r => r.GestionId == gestionId && r.AprobadoGrupo)
                .Select(r => r.UsuarioId)
                .ToListAsync();

            return await _context.Users
                .Include(u => u.Unidad)
                .Where(u => idsRegistrados.Contains(u.Id) && u.GrupoScoutUsuarios.Any(g => g.GrupoScoutId == grupoId))
                .ToListAsync();
        }
        public async Task<List<RegistroGestionResumenDto>> ObtenerResumenDeGrupoAsync(Guid adminId)
        {
            var gestion = await _context.Gestiones.FirstOrDefaultAsync(g => g.EstaActiva);
            if (gestion == null)
                throw new Exception("No hay gestión activa.");

            // Verificar que el usuario es admin de grupo
            var admin = await _context.Users
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.GrupoScout)
                        .ThenInclude(g => g.Unidades)
                .Include(u => u.GrupoScoutUsuarios)
                .FirstOrDefaultAsync(u => u.Id == adminId);

            if (admin == null || admin.Unidad?.GrupoScout == null)
                throw new Exception("No perteneces a un grupo scout.");

            var grupo = admin.Unidad.GrupoScout;

            if (!admin.GrupoScoutUsuarios.Any(g => g.EsAdminGrupo))
                throw new Exception("No tienes permisos de administrador de grupo.");

            // Obtener todos los usuarios (scouts y dirigentes) del grupo
            var usuarios = await _context.Users
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.GrupoScout)
                        .ThenInclude(g => g.NivelDistrito)
                .Where(u =>
                    u.Unidad != null &&
                    u.Unidad.GrupoScoutId == grupo.Id
                )
                .ToListAsync();

            // Obtener registros existentes
            var registros = await _context.RegistrosGestion
                .Where(r => r.GestionId == gestion.Id)
                .ToListAsync();

            var resumen = usuarios.Select(u =>
            {
                var registro = registros.FirstOrDefault(r => r.UsuarioId == u.Id);

                return new RegistroGestionResumenDto
                {
                    UsuarioId = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    CI = u.CI ?? "-",
                    Rama = u.Rama,
                    Tipo = u.Tipo,
                    UnidadNombre = u.Unidad?.Nombre ?? "-",
                    GrupoNombre = u.Unidad?.GrupoScout?.Nombre ?? "-",
                    DistritoNombre = u.Unidad?.GrupoScout?.NivelDistrito?.Nombre ?? "-",
                    AprobadoGrupo = registro?.AprobadoGrupo ?? false,
                    EnviadoADistrito = registro?.EnviadoADistrito ?? false,
                    AprobadoDistrito = registro?.AprobadoDistrito ?? false,
                    EnviadoANacional = registro?.EnviadoANacional ?? false,
                    AprobadoNacional = registro?.AprobadoNacional ?? false,
                    FechaAprobadoGrupo = registro?.FechaAprobadoGrupo,
                    FechaEnvioDistrito = registro?.FechaEnvioDistrito
                };

            }).ToList();

            return resumen;
        }

    }
}
