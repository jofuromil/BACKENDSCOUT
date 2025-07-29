using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendScout.Services
{
    public class MensajeGrupoService
    {
        private readonly AppDbContext _context;

        public MensajeGrupoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MensajeGrupo> EnviarMensajeAsync(MensajeGrupo mensaje)
        {
            mensaje.Id = Guid.NewGuid();
            mensaje.FechaEnvio = DateTime.Now;

            _context.MensajesGrupo.Add(mensaje);
            await _context.SaveChangesAsync();
            return mensaje;
        }

        public async Task<List<MensajeGrupo>> ObtenerMensajesPorGrupoAsync(int grupoId)
        {
            return await _context.MensajesGrupo
                .Include(m => m.Remitente)
                .Where(m => m.GrupoScoutId == grupoId)
                .OrderByDescending(m => m.FechaEnvio)
                .ToListAsync();
        }

        public async Task<bool> EliminarMensajeAsync(Guid mensajeId, Guid remitenteId)
        {
            var mensaje = await _context.MensajesGrupo
                .FirstOrDefaultAsync(m => m.Id == mensajeId && m.RemitenteId == remitenteId);

            if (mensaje == null)
                return false;

            _context.MensajesGrupo.Remove(mensaje);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<MensajeGrupo>> ObtenerMensajesParaUsuarioAsync(int grupoId, string tipoUsuario)
        {
            var mensajes = await _context.MensajesGrupo
                .Include(m => m.Remitente)
                .Where(m => m.GrupoScoutId == grupoId)
                .ToListAsync();

            return mensajes
                .Where(m =>
                    m.Destinatarios == "TODOS" ||
                    (tipoUsuario == "Dirigente" && m.Destinatarios == "DIRIGENTES") ||
                    (tipoUsuario == "Scout" && m.Destinatarios == "SCOUTS"))
                .OrderByDescending(m => m.FechaEnvio)
                .ToList();
        }
        public async Task<bool> EsAdminDelGrupoAsync(Guid dirigenteId, int grupoId)
        {
            return await _context.GrupoScoutUsuarios.AnyAsync(g =>
                g.UsuarioId == dirigenteId &&
                g.GrupoScoutId == grupoId &&
                g.EsAdminGrupo == true
            );
        }

        public async Task EliminarMensajesAntiguosAsync()
        {
            var fechaLimite = DateTime.UtcNow.AddDays(-60);

            var mensajesAntiguos = await _context.MensajesGrupo
                .Where(m => m.FechaEnvio < fechaLimite)
                .ToListAsync();

            if (mensajesAntiguos.Any())
            {
                _context.MensajesGrupo.RemoveRange(mensajesAntiguos);
                await _context.SaveChangesAsync();
            }
        }

    }
}
