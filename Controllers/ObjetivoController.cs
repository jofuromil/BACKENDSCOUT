using BackendScout.Data;
using BackendScout.Models;
using BackendScout.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObjetivoController : ControllerBase
    {
        private readonly ObjetivoService _service;
        private readonly AppDbContext _context;
        private readonly CargaObjetivosService _cargaService;
        private readonly PdfObjetivosService _pdfService;

        public ObjetivoController(
            ObjetivoService service,
            AppDbContext context,
            CargaObjetivosService cargaService,
            PdfObjetivosService pdfService)
        {
            _service = service;
            _context = context;
            _cargaService = cargaService;
            _pdfService = pdfService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> ListarPorRamaYNivel(
            [FromQuery] string rama,
            [FromQuery] string? nivelProgresion,
            [FromQuery] string? area)
        {
            var objetivos = await _service.ObtenerPorRamaYNivel(rama, nivelProgresion, area);
            return Ok(objetivos);
        }

        [HttpPost("seleccionar")]
        [Authorize(Roles = "Scout")]
        public async Task<IActionResult> SeleccionarObjetivo([FromBody] SeleccionObjetivoDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            try
            {
                var resultado = await _service.SeleccionarObjetivo(Guid.Parse(userId), dto.ObjetivoEducativoId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("validar")]
        public async Task<IActionResult> Validar([FromQuery] Guid dirigenteId, [FromQuery] Guid seleccionId)
        {
            try
            {
                var resultado = await _service.ValidarObjetivo(dirigenteId, seleccionId);
                return Ok(new { mensaje = "Objetivo validado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("historial")]
        [Authorize]
        public async Task<IActionResult> Historial([FromQuery] Guid usuarioId, [FromQuery] bool? soloValidados)
        {
            var solicitanteId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (solicitanteId == null) return Unauthorized();

            var solicitante = await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(solicitanteId));

            if (solicitante == null)
                return Unauthorized();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Scout")
                return Forbid();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Dirigente")
            {
                var scout = await _context.Users
                    .Include(u => u.Unidad)
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);

                if (scout == null || scout.UnidadId != solicitante.UnidadId)
                    return Forbid();
            }

            try
            {
                var historial = await _service.HistorialDeObjetivos(usuarioId, soloValidados);
                return Ok(historial);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("agregar-objetivo")]
        public async Task<IActionResult> AgregarObjetivo([FromBody] ObjetivoEducativo objetivo)
        {
            try
            {
                _context.ObjetivosEducativos.Add(objetivo);
                await _context.SaveChangesAsync();
                return Ok(objetivo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("cargar-excel")]
        public async Task<IActionResult> CargarDesdeExcel([FromQuery] string ruta)
        {
            try
            {
                var cantidad = await _cargaService.CargarDesdeExcel(ruta);
                return Ok(new { mensaje = $"Se cargaron {cantidad} objetivos desde el Excel." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("pendientes/scouts")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> ScoutsConPendientes()
        {
            try
            {
                var pendientes = await _service.ObtenerUsuariosConPendientes();
                return Ok(pendientes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("pendientes/por-dirigente")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> VerPendientes([FromQuery] Guid dirigenteId)
        {
            try
            {
                var pendientes = await _service.ObtenerPendientesPorDirigente(dirigenteId);
                return Ok(pendientes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("pendientes-por-unidad")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> ObtenerPendientesPorUnidad()
        {
            var dirigenteId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(dirigenteId)) return Unauthorized();

            var dirigente = await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(dirigenteId));

            if (dirigente?.Unidad == null)
                return BadRequest("El dirigente no está asignado a ninguna unidad.");

            var scoutsIds = await _context.Users
                .Where(u => u.UnidadId == dirigente.Unidad.Id && u.Tipo == "Scout")
                .Select(u => u.Id)
                .ToListAsync();

            var pendientes = await _context.ObjetivosSeleccionados
                .Where(o => scoutsIds.Contains(o.UsuarioId) && o.Validado == false)
                .Include(o => o.ObjetivoEducativo)
                .Include(o => o.Usuario)
                .ToListAsync();

            return Ok(pendientes);
        }

        [HttpGet("pendientes-scout")]
        [Authorize]
        public async Task<IActionResult> PendientesScout([FromQuery] Guid usuarioId)
        {
            var solicitanteId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (solicitanteId == null) return Unauthorized();

            var solicitante = await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(solicitanteId));

            if (solicitante == null)
                return Unauthorized();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Scout")
                return Forbid();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Dirigente")
            {
                var scout = await _context.Users
                    .Include(u => u.Unidad)
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);

                if (scout == null || scout.UnidadId != solicitante.UnidadId)
                    return Forbid();
            }

            try
            {
                var pendientes = await _service.ObtenerPendientesPorScout(usuarioId);
                return Ok(pendientes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("exportar-pdf")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> ExportarPdf([FromQuery] Guid usuarioId)
        {
            try
            {
                var pdfBytes = await _pdfService.GenerarPdfPorScout(usuarioId);
                return File(pdfBytes, "application/pdf", "objetivos_scout.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("resumen-scout")]
        [Authorize]
        public async Task<IActionResult> ResumenPorScout([FromQuery] Guid usuarioId)
        {
            var solicitanteId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (solicitanteId == null) return Unauthorized();

            var solicitante = await _context.Users
                .Include(u => u.Unidad)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(solicitanteId));

            if (solicitante == null)
                return Unauthorized();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Scout")
                return Forbid();

            if (solicitante.Id != usuarioId && solicitante.Tipo == "Dirigente")
            {
                var scout = await _context.Users
                    .Include(u => u.Unidad)
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);

                if (scout == null || scout.UnidadId != solicitante.UnidadId)
                    return Forbid();
            }

            try
            {
                var resumen = await _service.ObtenerResumenPorScout(usuarioId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }

    public class SeleccionObjetivoDto
    {
        public Guid ObjetivoEducativoId { get; set; }
    }
}
