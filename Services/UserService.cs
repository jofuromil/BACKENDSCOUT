using BackendScout.Data;
using BackendScout.Dtos;
using BackendScout.DTOs;
using BackendScout.Models;
using BackendScout.Dtos.Grupo;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace BackendScout.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public User? ObtenerUsuarioPorCorreo(string correo)
        {
            return _context.Users.FirstOrDefault(u => u.Correo == correo);
        }

        public async Task<User> RegistrarUsuario(User user)
        {
            int edad = CalcularEdad(user.FechaNacimiento);

            if (edad > 21)
                user.Tipo = "Dirigente";
            else
                user.Tipo = "Scout";

            if (user.Tipo == "Scout")
            {
                if (edad >= 6 && edad <= 10)
                    user.Rama = "Lobatos";
                else if (edad >= 11 && edad <= 14)
                    user.Rama = "Exploradores";
                else if (edad >= 15 && edad <= 17)
                    user.Rama = "Pioneros";
                else if (edad >= 18 && edad <= 21)
                    user.Rama = "Rovers";
                else
                    user.Rama = "Sin Rama";
            }
            else
            {
                if (edad < 18)
                    throw new Exception("Un dirigente no puede tener menos de 18 años.");
                user.Rama = "Dirigente";
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public bool ExisteUsuario(string correo)
        {
            return _context.Users.Any(u => u.Correo == correo);
        }

        public async Task<User?> ObtenerPorIdConUnidad(Guid id)
        {
            return await _context.Users
                .Include(u => u.GrupoScoutUsuarios)
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.GrupoScout)       // ✅ Añadir esta línea
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.NivelDistrito)   // ✅ Ya estaba, lo mantenemos
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<List<User>> ObtenerUsuarios()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> ValidarLogin(string email, string password)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Correo == email);
        }

        private int CalcularEdad(DateTime fechaNacimiento)
        {
            var hoy = DateTime.Today;
            var edad = hoy.Year - fechaNacimiento.Year;
            if (fechaNacimiento.Date > hoy.AddYears(-edad)) edad--;
            return edad;
        }

        public async Task<bool> UnirseUnidad(Guid usuarioId, string codigoUnidad)
        {
            var unidad = await _context.Unidades.FirstOrDefaultAsync(u => u.CodigoUnidad == codigoUnidad);
            if (unidad == null)
                throw new Exception("Código de unidad no válido.");

            var usuario = await _context.Users.FirstOrDefaultAsync(u => u.Id == usuarioId);
            if (usuario == null)
                throw new Exception("Usuario no encontrado.");

            if (usuario.UnidadId != null)
                throw new Exception("Ya estás en una unidad. Debes salir antes de unirte a otra.");

            if (usuario.Tipo == "Scout" && usuario.Rama.ToLower() != unidad.Rama.ToLower())
                throw new Exception("No puedes unirte a esta unidad porque no corresponde a tu rama.");

            usuario.UnidadId = unidad.Id;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SalirDeUnidad(Guid usuarioId)
        {
            var usuario = await _context.Users.FirstOrDefaultAsync(u => u.Id == usuarioId);
            if (usuario == null)
                throw new Exception("Usuario no encontrado.");

            if (usuario.UnidadId == null)
                throw new Exception("No estás en ninguna unidad.");

            usuario.UnidadId = null;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarUsuarioDeUnidad(Guid dirigenteId, Guid usuarioAEliminarId)
        {
            var dirigente = await _context.Users.FirstOrDefaultAsync(u => u.Id == dirigenteId);
            if (dirigente == null || dirigente.Tipo.ToLower() != "dirigente")
                throw new Exception("Solo los dirigentes pueden eliminar miembros.");

            var usuario = await _context.Users.FirstOrDefaultAsync(u => u.Id == usuarioAEliminarId);
            if (usuario == null)
                throw new Exception("El usuario a eliminar no fue encontrado.");

            if (dirigente.Id == usuario.Id)
                throw new Exception("No puedes eliminarte a ti mismo.");

            if (dirigente.UnidadId == null || dirigente.UnidadId != usuario.UnidadId)
                throw new Exception("Solo puedes eliminar usuarios de tu misma unidad.");

            usuario.UnidadId = null;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<User>> ObtenerMiembrosDeUnidad(Guid dirigenteId, string? tipo = null)
        {
            var dirigente = await _context.Users.FirstOrDefaultAsync(u => u.Id == dirigenteId);

            if (dirigente == null)
                throw new Exception("Dirigente no encontrado.");

            if (dirigente.Tipo.ToLower() != "dirigente")
                throw new Exception("Solo los dirigentes pueden ver miembros de la unidad.");

            if (dirigente.UnidadId == null)
                throw new Exception("No estás en ninguna unidad.");

            var query = _context.Users.Where(u => u.UnidadId == dirigente.UnidadId);

            if (!string.IsNullOrEmpty(tipo))
            {
                query = query.Where(u => u.Tipo.ToLower() == tipo.ToLower());
            }

            return await query.ToListAsync();
        }

        // 🔹 MÉTODO: Obtener perfil de usuario
        public async Task<UserDto?> ObtenerPerfilAsync(Guid usuarioId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == usuarioId);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                CI = user.CI,
                ComplementoCI = user.ComplementoCI, // ✅ Campo agregado
                NombreCompleto = user.NombreCompleto,
                FechaNacimiento = user.FechaNacimiento,
                Telefono = user.Telefono,
                Correo = user.Correo,
                Ciudad = user.Ciudad,
                Tipo = user.Tipo,
                Rama = user.Rama,
                Direccion = user.Direccion,
                InstitucionEducativa = user.InstitucionEducativa,
                NivelEstudios = user.NivelEstudios,
                Genero = user.Genero,
                Profesion = user.Profesion,
                Ocupacion = user.Ocupacion,
            };
        }

        // 🔹 MÉTODO: Actualizar perfil
        public async Task<bool> ActualizarPerfilAsync(Guid usuarioId, ActualizarPerfilRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == usuarioId);
            if (user == null) return false;

            user.CI = request.CI;
            user.ComplementoCI = request.ComplementoCI; // ✅ Campo agregado
            user.NombreCompleto = request.NombreCompleto;
            user.FechaNacimiento = request.FechaNacimiento;
            user.Telefono = request.Telefono;
            user.Ciudad = request.Ciudad;
            user.Direccion = request.Direccion;
            user.InstitucionEducativa = request.InstitucionEducativa;
            user.NivelEstudios = request.NivelEstudios;
            user.Genero = request.Genero;
            user.Profesion = request.Profesion;
            user.Ocupacion = request.Ocupacion;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task ActualizarPassword(User usuario)
        {
            _context.Users.Update(usuario);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> PerteneceALaMismaUnidad(Guid dirigenteId, Guid usuarioId)
        {
            var dirigente = await _context.Users.FindAsync(dirigenteId);
            var usuario = await _context.Users.FindAsync(usuarioId);
            if (dirigente == null || usuario == null) return false;
            return dirigente.UnidadId != null && dirigente.UnidadId == usuario.UnidadId;
        }
        public async Task<User?> ObtenerPorId(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }
        public async Task<User?> ObtenerScoutConUnidad(Guid scoutId)
        {
            return await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == scoutId && u.Tipo == "Scout");
        }
        public async Task<List<UserDto>> ObtenerDirigentesDelGrupo(Guid userId)
        {
            var usuario = await _context.Users
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.GrupoScout)
                .Include(u => u.GrupoScoutUsuarios)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (usuario == null || usuario.Unidad == null || usuario.Unidad.GrupoScout == null)
                throw new Exception("Usuario no tiene unidad o grupo scout asignado.");

            if (!usuario.GrupoScoutUsuarios.Any(g => g.EsAdminGrupo))
                throw new Exception("No tienes permisos para ver esta información.");

            var grupoScoutId = usuario.Unidad.GrupoScoutId;

            var dirigentes = await _context.Users
                .Include(u => u.Unidad)
                    .ThenInclude(u => u.GrupoScout)
                .Include(u => u.GrupoScoutUsuarios)
                .Where(u =>
                    u.Tipo == "Dirigente" &&
                    u.Unidad != null &&
                    u.Unidad.GrupoScoutId == grupoScoutId
                )
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    CI = u.CI,
                    ComplementoCI = u.ComplementoCI,
                    NombreCompleto = u.NombreCompleto,
                    FechaNacimiento = u.FechaNacimiento,
                    Telefono = u.Telefono,
                    Correo = u.Correo,
                    Ciudad = u.Ciudad,
                    Tipo = u.Tipo,
                    Rama = u.Rama,
                    UnidadNombre = u.Unidad.Nombre,
                    Direccion = u.Direccion,
                    InstitucionEducativa = u.InstitucionEducativa,
                    NivelEstudios = u.NivelEstudios,
                    Genero = u.Genero,
                    Profesion = u.Profesion,
                    Ocupacion = u.Ocupacion,

                    // ✅ Campo nuevo: admin de grupo
                    EsAdminGrupo = u.GrupoScoutUsuarios
                        .Any(g => g.GrupoScoutId == grupoScoutId && g.EsAdminGrupo)
                })
                .ToListAsync();

            return dirigentes;
        }

        public async Task<List<UserDto>> ObtenerScoutsDelGrupoAsync(Guid usuarioId)
        {
            var dirigente = await _context.Users
                .Include(u => u.GrupoScoutUsuarios)
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            var grupoId = dirigente?.GrupoScoutUsuarios?.FirstOrDefault()?.GrupoScoutId;
            if (grupoId == null || grupoId == 0)
            {
                return new List<UserDto>();
            }

            var scouts = await _context.Users
                .Include(u => u.Unidad)
                .Where(u => u.Tipo == "Scout" && u.Unidad != null && u.Unidad.GrupoScoutId == grupoId)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    CI = u.CI,
                    NombreCompleto = u.NombreCompleto,
                    FechaNacimiento = u.FechaNacimiento,
                    Telefono = u.Telefono,
                    Correo = u.Correo,
                    Ciudad = u.Ciudad,
                    Tipo = u.Tipo,
                    Rama = u.Rama,
                    UnidadNombre = u.Unidad.Nombre,
                    Direccion = u.Direccion,
                    InstitucionEducativa = u.InstitucionEducativa,
                    NivelEstudios = u.NivelEstudios,
                    Genero = u.Genero,
                    Profesion = u.Profesion,
                    Ocupacion = u.Ocupacion
                })
                .ToListAsync();

            return scouts;
        }

        public async Task<User?> ObtenerUsuarioPorIdAsync(Guid id)
            {
                return await _context.Users
                    .Include(u => u.Unidad)
                    .Include(u => u.GrupoScoutUsuarios)
                    .ThenInclude(gu => gu.GrupoScout)
                    .FirstOrDefaultAsync(u => u.Id == id);
            }


    }
}
