using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendScout.Services
{
    public class DistritoUsuarioService
    {
        private readonly AppDbContext _context;

        public DistritoUsuarioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DistritoUsuario>> ObtenerUsuariosPorDistrito(int distritoId)
        {
            return await _context.DistritoUsuarios
                .Include(du => du.Usuario)
                .Where(du => du.NivelDistritoId == distritoId)
                .ToListAsync();
        }

        public async Task<List<DistritoUsuario>> ObtenerDistritosPorUsuario(Guid usuarioId)
        {
            return await _context.DistritoUsuarios
                .Include(du => du.NivelDistrito)
                .Where(du => du.UsuarioId == usuarioId)
                .ToListAsync();
        }

        public async Task<bool> AsignarUsuarioADistrito(Guid usuarioId, int distritoId, string rol)
        {
            var yaExiste = await _context.DistritoUsuarios
                .AnyAsync(du => du.UsuarioId == usuarioId && du.NivelDistritoId == distritoId);

            if (yaExiste) return false;

            var entidad = new DistritoUsuario
            {
                UsuarioId = usuarioId,
                NivelDistritoId = distritoId,
                Rol = rol,
                FechaAsignacion = DateTime.UtcNow
            };

            _context.DistritoUsuarios.Add(entidad);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> QuitarUsuarioDelDistrito(Guid usuarioId, int distritoId)
        {
            var registro = await _context.DistritoUsuarios
                .FirstOrDefaultAsync(du => du.UsuarioId == usuarioId && du.NivelDistritoId == distritoId);

            if (registro == null) return false;

            _context.DistritoUsuarios.Remove(registro);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
