using BackendScout.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BackendScout.Dtos;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/nacional")]
    public class NacionalController : ControllerBase
    {
        private readonly NacionalService _nacionalService;

        public NacionalController(NacionalService nacionalService)
        {
            _nacionalService = nacionalService;
        }

        // ======= Utilidad: saber si el usuario actual es AdminNacional
        [HttpGet("soy-admin")]
        [Authorize]
        public async Task<IActionResult> SoyAdmin()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = new Guid(userIdStr);
            var es = await _nacionalService.EsAdminNacionalAsync(userId);
            return Ok(new { esAdminNacional = es });
        }

        // ======= Asignar rol de AdminNacional a un usuario
        public class AsignarAdminDto { public Guid UsuarioId { get; set; } }

        [HttpPost("asignar-admin")]
        [Authorize] // puedes afinar la política más adelante
        public async Task<IActionResult> AsignarAdmin([FromBody] AsignarAdminDto dto)
        {
            if (dto == null || dto.UsuarioId == Guid.Empty)
                return BadRequest("UsuarioId inválido");

            var ok = await _nacionalService.AsignarAdminNacionalAsync(dto.UsuarioId);
            return Ok(new { asignado = ok });
        }

        // ======= Listar pendientes de aprobación nacional
        [HttpGet("pendientes")]
        [Authorize]
        public async Task<IActionResult> Pendientes()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = new Guid(userIdStr);

            // verifica rol
            if (!await _nacionalService.EsAdminNacionalAsync(userId))
                return Forbid();

            var regs = await _nacionalService.ObtenerPendientesAsync();

            var resultado = regs.Select(r => new
            {
                usuarioId = r.UsuarioId,
                nombreCompleto = r.Usuario?.NombreCompleto,
                ci = r.Usuario?.CI,
                fechaNacimiento = r.Usuario?.FechaNacimiento,
                rama = r.Usuario?.Rama,
                unidad = r.Usuario?.Unidad?.Nombre,
                grupo = r.Usuario?.Unidad?.GrupoScout?.Nombre,
                distrito = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Nombre
            });

            return Ok(resultado);
        }

        // ======= Aprobar individual
        public class AprobarNacionalDto { public Guid UsuarioId { get; set; } }

        [HttpPost("aprobar")]
        [Authorize]
        public async Task<IActionResult> Aprobar([FromBody] AprobarNacionalDto dto)
        {
            if (dto == null || dto.UsuarioId == Guid.Empty)
                return BadRequest("UsuarioId inválido");

            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var ok = await _nacionalService.AprobarNacionalIndividualAsync(dto.UsuarioId);
            return ok ? Ok(new { aprobado = true }) : BadRequest(new { aprobado = false });
        }

        // ======= Aprobar todos los pendientes
        [HttpPost("aprobar-todos")]
        [Authorize]
        public async Task<IActionResult> AprobarTodos()
        {
            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var n = await _nacionalService.AprobarTodosPendientesAsync();
            return Ok(new { aprobados = n });
        }
        [HttpGet("resumen")]
        [Authorize]
        public async Task<IActionResult> Resumen()
        {
            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var dto = await _nacionalService.ObtenerResumenAsync();
            return Ok(dto);
        }
        // Resumen por distrito (enviados / aprobados / pendientes)
        [HttpGet("pendientes/resumen-por-distrito")]
        [Authorize]
        public async Task<IActionResult> PendientesResumenPorDistrito()
        {
            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var dto = await _nacionalService.ObtenerResumenPendientesPorDistritoAsync();
            return Ok(dto);
        }

        // Lista de pendientes solo de un distrito
        [HttpGet("pendientes/distrito/{distritoId:int}")]
        [Authorize]
        public async Task<IActionResult> PendientesDeDistrito([FromRoute] int distritoId)
        {
            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var regs = await _nacionalService.ObtenerPendientesPorDistritoAsync(distritoId);
            var resultado = regs.Select(r => new
            {
                usuarioId = r.UsuarioId,
                nombreCompleto = r.Usuario?.NombreCompleto,
                ci = r.Usuario?.CI,
                fechaNacimiento = r.Usuario?.FechaNacimiento,
                rama = r.Usuario?.Rama,
                unidad = r.Usuario?.Unidad?.Nombre,
                grupo = r.Usuario?.Unidad?.GrupoScout?.Nombre,
                distrito = r.Usuario?.Unidad?.GrupoScout?.NivelDistrito?.Nombre
            });

            return Ok(resultado);
        }

        // Aprobar todos los pendientes de un distrito
        [HttpPost("aprobar-todos/distrito/{distritoId:int}")]
        [Authorize]
        public async Task<IActionResult> AprobarTodosDeDistrito([FromRoute] int distritoId)
        {
            var currentUser = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (!await _nacionalService.EsAdminNacionalAsync(currentUser))
                return Forbid();

            var n = await _nacionalService.AprobarTodosPendientesPorDistritoAsync(distritoId);
            return Ok(new { aprobados = n });
        }

    }
}
