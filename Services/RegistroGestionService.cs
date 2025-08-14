using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;
using BackendScout.DTOs;
using BackendScout.Dtos;

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
            var usuario = await _context.Users
                .Include(u => u.Unidad)
                .ThenInclude(u => u.GrupoScout)
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                throw new Exception("Usuario no encontrado.");

            // ✅ Validación de datos mínimos obligatorios
            if (string.IsNullOrWhiteSpace(usuario.CI) ||
                usuario.FechaNacimiento == default ||
                string.IsNullOrWhiteSpace(usuario.Rama) ||
                usuario.Unidad == null ||
                usuario.Unidad.GrupoScout == null)
            {
                throw new Exception("El usuario no tiene todos los datos obligatorios completos para registrarlo.");
            }

            var registro = await _context.RegistrosGestion
                .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId && r.GestionId == gestionId);

            if (registro == null)
            {
                // ✅ Validación de existencia real en la base de datos
                var unidadExiste = await _context.Unidades.AnyAsync(u => u.Id == usuario.UnidadId);
                var grupoExiste = await _context.GruposScout.AnyAsync(g => g.Id == usuario.Unidad.GrupoScout.Id);
                var gestionExiste = await _context.Gestiones.AnyAsync(g => g.Id == gestionId);

                if (!unidadExiste || !grupoExiste || !gestionExiste)
                    throw new Exception("Datos de unidad, grupo o gestión inválidos o inexistentes en la base de datos.");

                var nuevoRegistro = new RegistroGestion
                {
                    Id = Guid.NewGuid(),
                    UsuarioId = usuarioId,
                    GestionId = gestionId,
                    UnidadId = usuario.UnidadId.Value,
                    GrupoScoutId = usuario.Unidad.GrupoScout.Id,
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
        public async Task<List<User>> ObtenerUsuariosRegistradosPorGestion(int grupoId, Guid gestionId)
        {
            return await _context.RegistrosGestion
                .Where(rg => rg.Usuario.GrupoScoutUsuarios.Any(g => g.GrupoScoutId == grupoId)
                        && rg.GestionId == gestionId
                        && rg.AprobadoGrupo)
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
        public async Task<List<(Guid UsuarioId, bool EnviadoADistrito)>> ObtenerUsuariosRegistradosActivosAsync(int grupoId, Guid gestionId)
        {
            return await _context.RegistrosGestion
                .Where(r => r.GestionId == gestionId &&
                            r.AprobadoGrupo &&
                            r.Usuario.Unidad != null &&
                            r.Usuario.Unidad.GrupoScoutId == grupoId)
                .Select(r => new ValueTuple<Guid, bool>(r.UsuarioId, r.EnviadoADistrito))
                .ToListAsync();
        }
        public async Task<List<RegistroResumenGrupoDto>> ObtenerResumenPorDistrito(int distritoId)
        {
            var registros = await _context.RegistrosGestion
                .Include(r => r.Unidad)
                .ThenInclude(u => u.GrupoScout)
                .Where(r =>
                    r.EnviadoADistrito &&
                    r.Unidad.GrupoScout != null &&
                    r.Unidad.GrupoScout.NivelDistritoId == distritoId)
                .ToListAsync();

            var resumen = registros
                .GroupBy(r => new
                {
                    r.Unidad.GrupoScoutId,
                    r.Unidad.GrupoScout.Nombre
                })
                .Select(g => new RegistroResumenGrupoDto
                {
                    GrupoId = g.Key.GrupoScoutId,
                    NombreGrupo = g.Key.Nombre,
                    Enviados = g.Count(),
                    Aprobados = g.Count(r => r.AprobadoDistrito)
                })
                .ToList();

            return resumen;
        }
        public async Task<List<RegistroResumenGrupoDto>> ObtenerResumenPorDistritoPorUsuarioAsync(Guid usuarioId)
        {
            var usuario = await _context.Users
                .Include(u => u.GrupoScoutUsuarios)
                    .ThenInclude(gsu => gsu.GrupoScout)
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            var distritoId = usuario.GrupoScoutUsuarios
                .FirstOrDefault()?.GrupoScout?.NivelDistritoId;

            if (distritoId == null)
                throw new Exception("El usuario no está asociado a un grupo con distrito válido");

            var registros = await _context.RegistrosGestion
                .Include(r => r.Unidad)
                    .ThenInclude(u => u.GrupoScout)
                .Where(r =>
                    r.EnviadoADistrito &&
                    r.Unidad.GrupoScout != null &&
                    r.Unidad.GrupoScout.NivelDistritoId == distritoId)
                .ToListAsync();

            var resumen = registros
                .GroupBy(r => new
                {
                    r.Unidad.GrupoScoutId,
                    r.Unidad.GrupoScout.Nombre
                })
                .Select(g => new RegistroResumenGrupoDto
                {
                    GrupoId = g.Key.GrupoScoutId,
                    NombreGrupo = g.Key.Nombre,
                    Enviados = g.Count(),
                    Aprobados = g.Count(r => r.AprobadoDistrito)
                })
                .ToList();

            return resumen;
        }
        // CORREGIDO: Usar Guid en lugar de int
        public async Task<List<RegistroGestion>> ObtenerRegistrosPorGrupoAsync(int grupoId, Guid gestionId)
        {
            return await _context.RegistrosGestion
                .Include(r => r.Usuario)
                .Include(r => r.Unidad)
                .ThenInclude(u => u.GrupoScout)

                .Where(r =>
                    r.Unidad != null &&
                    r.Unidad.GrupoScoutId == grupoId &&
                    r.GestionId == gestionId && // Guid == Guid
                    r.EnviadoADistrito)
                .ToListAsync();
        }

        public async Task AprobarRegistroDesdeDistritoAsync(Guid usuarioId, Guid gestionId)
        {
            var registro = await _context.RegistrosGestion
                .FirstOrDefaultAsync(r =>
                    r.UsuarioId == usuarioId &&
                    r.GestionId == gestionId &&
                    r.EnviadoADistrito);

            if (registro == null)
                throw new Exception("El registro no fue encontrado o no fue enviado por el grupo.");

            registro.AprobadoDistrito = true;
            registro.FechaAprobadoDistrito = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
        public async Task AprobarTodosPendientesDistritoAsync(int distritoId)
        {
            var registros = await _context.RegistrosGestion
                .Include(r => r.Unidad)
                .Where(r => r.Unidad.NivelDistritoId == distritoId && r.EnviadoADistrito && !r.AprobadoDistrito)
                .ToListAsync();

            foreach (var r in registros)
            {
                r.AprobadoDistrito = true;
                r.FechaAprobadoDistrito = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
        public async Task AprobarTodosPendientesPorGrupoAsync(int grupoId)
        {
            var registros = await _context.RegistrosGestion
                .Include(r => r.Unidad)
                .Where(r =>
                    r.Unidad != null &&
                    r.Unidad.GrupoScoutId == grupoId &&
                    r.EnviadoADistrito &&
                    !r.AprobadoDistrito)
                .ToListAsync();

            foreach (var registro in registros)
            {
                registro.AprobadoDistrito = true;
                registro.FechaAprobadoDistrito = DateTime.UtcNow; // ✅ nombre correcto
            }

            await _context.SaveChangesAsync();
        }
        

    }
}
