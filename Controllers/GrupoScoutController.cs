using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BackendScout.Services;
using System;
using System.Threading.Tasks;
using BackendScout.Data;
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;
using BackendScout.Dtos.Grupo;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/gruposcout")]
    public class GrupoScoutController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly GrupoScoutService _grupoScoutService;
        private readonly AppDbContext _context;

        public GrupoScoutController(UserService userService, GrupoScoutService grupoScoutService, AppDbContext context)
        {
            _userService = userService;
            _grupoScoutService = grupoScoutService;
            _context = context;
        }

        [HttpGet("dirigentes")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> ObtenerDirigentesDelGrupo()
        {
            var userId = User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
            var dirigentes = await _userService.ObtenerDirigentesDelGrupo(Guid.Parse(userId));
            return Ok(dirigentes);
        }

        [HttpGet("ver-scouts/{usuarioId}")]
        public async Task<IActionResult> VerScoutsDelGrupo(Guid usuarioId)
        {
            var scouts = await _userService.ObtenerScoutsDelGrupoAsync(usuarioId);
            return Ok(scouts);
        }

        [HttpPut("asignar-admingrupo/{userId}")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> AsignarAdminGrupo(Guid userId)
        {
            var usuarioActualId = ObtenerUsuarioIdDesdeToken();
            var usuarioActual = await _context.Users
                .Include(u => u.GrupoScoutUsuarios)
                .FirstOrDefaultAsync(u => u.Id == usuarioActualId);

            if (usuarioActual == null)
                return Unauthorized();

            var grupoUsuario = usuarioActual.GrupoScoutUsuarios.FirstOrDefault();
            if (grupoUsuario == null)
                return BadRequest("No estás vinculado a ningún grupo scout.");

            var grupoScoutId = grupoUsuario.GrupoScoutId;

            var existente = await _context.GrupoScoutUsuarios
                .FirstOrDefaultAsync(g => g.GrupoScoutId == grupoScoutId && g.UsuarioId == userId);

            if (existente != null)
            {
                existente.EsAdminGrupo = true;
            }
            else
            {
                _context.GrupoScoutUsuarios.Add(new GrupoScoutUsuario
                {
                    UsuarioId = userId,
                    GrupoScoutId = grupoScoutId,
                    EsAdminGrupo = true
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("quitar-admingrupo/{userId}")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> QuitarAdminGrupo(Guid userId)
        {
            var usuarioActualId = ObtenerUsuarioIdDesdeToken();
            var usuarioActual = await _context.Users
                .Include(u => u.GrupoScoutUsuarios)
                .FirstOrDefaultAsync(u => u.Id == usuarioActualId);

            if (usuarioActual == null)
                return Unauthorized();

            var grupoUsuario = usuarioActual.GrupoScoutUsuarios.FirstOrDefault();
            if (grupoUsuario == null)
                return BadRequest("No estás vinculado a ningún grupo scout.");

            var grupoScoutId = grupoUsuario.GrupoScoutId;

            var existente = await _context.GrupoScoutUsuarios
                .FirstOrDefaultAsync(g => g.GrupoScoutId == grupoScoutId && g.UsuarioId == userId);

            if (existente == null)
                return NotFound("El usuario no es administrador del grupo.");

            existente.EsAdminGrupo = false;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("{grupoId}/resumen-unidades")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> VerResumenUnidades(string grupoId)
        {
            try
            {
                var resumen = await _grupoScoutService.ObtenerResumenUnidadesPorGrupoAsync(grupoId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = "Error al obtener el resumen de unidades", error = ex.Message });
            }
        }

        private Guid ObtenerUsuarioIdDesdeToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdClaim.Value);
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> ObtenerGrupoScoutPorId(int id)
        {
            var grupo = await _context.GruposScout
                .Include(g => g.NivelDistrito)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null)
                return NotFound("Grupo scout no encontrado");

            return Ok(new
            {
                grupo.Id,
                grupo.Nombre,
                Distrito = grupo.NivelDistrito?.Nombre
            });
        }
        [HttpGet("{grupoId}/resumen-registros")]
        public async Task<IActionResult> VerResumenUnidades(int grupoId)
        {
            try
            {
                var resumen = await _grupoScoutService.ObtenerResumenDeRegistrosPorUnidadAsync(grupoId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = "Error al obtener el resumen de registros.", error = ex.Message });
            }
        }
        
        [HttpGet("{grupoId}/resumen-enviados")]
        public async Task<IActionResult> VerResumenenviados(int grupoId)
        {
            try
            {
                var resumen = await _grupoScoutService.ObtenerResumenDeenviadosPorUnidadAsync(grupoId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = "Error al obtener el resumen de registros.", error = ex.Message });
            }
        }
    }
}
