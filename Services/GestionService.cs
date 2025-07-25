using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendScout.Services
{
    public class GestionService
    {
        private readonly AppDbContext _context;

        public GestionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Gestion?> ObtenerGestionActivaAsync()
        {
            return await _context.Gestiones.FirstOrDefaultAsync(g => g.Activa);
        }

        public async Task<Gestion> CrearNuevaGestionAsync(string nombre)
        {
            var gestionActiva = await ObtenerGestionActivaAsync();

            if (gestionActiva != null)
            {
                gestionActiva.Activa = false;
            }

            var nuevaGestion = new Gestion
            {
                Nombre = nombre,
                FechaInicio = DateTime.UtcNow,
                Activa = true
            };

            _context.Gestiones.Add(nuevaGestion);
            await _context.SaveChangesAsync();

            return nuevaGestion;
        }

        public async Task<List<Gestion>> ObtenerHistorialGestionesAsync()
        {
            return await _context.Gestiones
                .OrderByDescending(g => g.FechaInicio)
                .ToListAsync();
        }
        public async Task<Gestion?> ObtenerGestionPorNombreAsync(string nombre)
        {
            return await _context.Gestiones
                .FirstOrDefaultAsync(g => g.Nombre == nombre);
        }
    }
}
