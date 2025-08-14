using BackendScout.Models;
using BackendScout.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendScout.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistroGestionController : ControllerBase
    {
        private readonly RegistroGestionService _registroService;
        private readonly UserService _userService;
        private readonly GestionService _gestionService;

        public RegistroGestionController(
            RegistroGestionService registroService,
            UserService userService,
            GestionService gestionService)
        {
            _registroService = registroService;
            _userService = userService;
            _gestionService = gestionService;
        }

        [HttpGet("grupo")]
        public async Task<IActionResult> ObtenerRegistrosGrupo()
        {
            var userId = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var dirigente = await _userService.ObtenerUsuarioPorIdAsync(userId);
            var grupoId = dirigente?.GrupoScoutUsuarios?.FirstOrDefault()?.GrupoScoutId;

            if (grupoId == null || grupoId == 0)
                return BadRequest("No pertenece a ningún grupo scout.");

            var gestionActiva = await _gestionService.ObtenerGestionActivaAsync();
            if (gestionActiva == null)
                return NotFound("No hay gestión activa.");

            var registros = await _registroService.ObtenerRegistrosGrupoAsync(grupoId.Value);

            var resultado = registros
                .Where(r => r.GestionId == gestionActiva.Id)
                .Select(r => new
                {
                    r.Usuario.Id,
                    r.Usuario.NombreCompleto,
                    r.Usuario.CI,
                    r.Usuario.FechaNacimiento,
                    r.Usuario.Genero,
                    r.Usuario.Rama,
                    Unidad = r.Usuario.Unidad?.Nombre,
                    Colegio = r.Usuario.InstitucionEducativa,
                    Curso = r.Usuario.NivelEstudios,
                    Profesion = r.Usuario.Profesion,
                    Ocupacion = r.Usuario.Ocupacion,
                    Registrado = r.AprobadoGrupo,
                    FechaRegistro = r.FechaAprobadoGrupo,
                    EstadoRegistro = r.AprobadoGrupo ? "REGISTRADO" : "NINGUNO" // 👈 AGREGA ESTO
                }).ToList();

            return Ok(resultado);
        }

        [HttpPost("registrar/{usuarioId}")]
        public async Task<IActionResult> RegistrarUsuario(Guid usuarioId)
        {
            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            await _registroService.RegistrarUsuarioEnGestionAsync(usuarioId, gestion.Id);
            return Ok(new { mensaje = "Registro aprobado correctamente." });
        }

        [HttpDelete("quitar/{usuarioId}")]
        public async Task<IActionResult> QuitarRegistro(Guid usuarioId)
        {
            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            await _registroService.QuitarRegistroDeUsuarioAsync(usuarioId, gestion.Id);
            return Ok(new { mensaje = "Registro eliminado correctamente." });
        }
        [HttpPost("enviar-distrito/{usuarioId}")]
        public async Task<IActionResult> EnviarRegistroADistrito(Guid usuarioId)
        {
            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            try
            {
                await _registroService.EnviarRegistroADistritoAsync(usuarioId, gestion.Id);
                return Ok(new { mensaje = "Registro enviado al distrito correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpGet("resumen-grupo/{adminId}")]
        public async Task<IActionResult> ObtenerResumenGrupo(Guid adminId)
        {
            try
            {
                var lista = await _registroService.ObtenerResumenDeGrupoAsync(adminId);
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("registrados")]
        public async Task<IActionResult> ObtenerSoloRegistrados()
        {
            var userId = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var dirigente = await _userService.ObtenerUsuarioPorIdAsync(userId);
            var grupoId = dirigente?.GrupoScoutUsuarios?.FirstOrDefault()?.GrupoScoutId;

            if (grupoId == null || grupoId == 0)
                return BadRequest("No pertenece a ningún grupo scout.");

            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            var registros = await _registroService.ObtenerUsuariosRegistradosActivosAsync(grupoId.Value, gestion.Id);

            var resultado = registros.Select(r => new
            {
                usuarioId = r.UsuarioId,
                enviadoADistrito = r.EnviadoADistrito
            });

            return Ok(resultado);
        }

        [HttpGet("registrados/{gestion}")]
        public async Task<IActionResult> ObtenerUsuariosRegistradosPorGestion(string gestion)
        {
            var gestionActiva = await _gestionService.ObtenerGestionPorNombreAsync(gestion);
            if (gestionActiva == null)
                return NotFound("No se encontró la gestión.");

            var userId = new Guid(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var dirigente = await _userService.ObtenerUsuarioPorIdAsync(userId);
            var grupoId = dirigente?.GrupoScoutUsuarios?.FirstOrDefault()?.GrupoScoutId;

            if (grupoId == null || grupoId == 0)
                return BadRequest("No pertenece a ningún grupo scout.");

            var usuarios = await _registroService.ObtenerUsuariosRegistradosPorGestion(grupoId.Value, gestionActiva.Id);

            var resultado = usuarios.Select(u => new
            {
                u.Id,
                u.NombreCompleto,
                u.CI,
                u.FechaNacimiento,
                u.Genero,
                u.Rama,
                Unidad = u.Unidad?.Nombre,
                Colegio = u.InstitucionEducativa,
                Curso = u.NivelEstudios,
                Profesion = u.Profesion,
                Ocupacion = u.Ocupacion
            });

            return Ok(resultado);
        }
        [HttpGet("resumen-distrito/{distritoId}")]
        public async Task<IActionResult> ObtenerResumenPorDistrito(int distritoId)
        {
            var resumen = await _registroService.ObtenerResumenPorDistrito(distritoId);
            return Ok(resumen);
        }
        [HttpGet("resumen-distrito-por-usuario/{usuarioId}")]
        public async Task<IActionResult> ObtenerResumenPorDistritoPorUsuario(Guid usuarioId)
        {
            try
            {
                var resumen = await _registroService.ObtenerResumenPorDistritoPorUsuarioAsync(usuarioId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
        [HttpGet("registros-por-grupo/{grupoId}")]
        public async Task<IActionResult> ObtenerRegistrosPorGrupo(int grupoId)
        {
            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            var registros = await _registroService.ObtenerRegistrosPorGrupoAsync(grupoId, gestion.Id);

            var resultado = registros.Select(r => new
            {
                usuarioId = r.UsuarioId,
                nombreCompleto = r.Usuario.NombreCompleto,
                ci = r.Usuario.CI,
                rama = r.Usuario.Rama,
                tipo = r.Usuario.Tipo,
                unidadNombre = r.Usuario.Unidad?.Nombre ?? "",
                grupoNombre = r.Unidad.GrupoScout.Nombre,
                aprobadoDistrito = r.AprobadoDistrito,
                enviadoANacional = r.EnviadoANacional   // 👈 agregado
            });

            return Ok(resultado);
        }

        [HttpPost("aprobar-distrito")]
        public async Task<IActionResult> AprobarRegistroDesdeDistrito([FromBody] AprobacionDistritoRequest request)
        {
            var gestion = await _gestionService.ObtenerGestionActivaAsync();
            if (gestion == null)
                return NotFound("No hay gestión activa.");

            try
            {
                await _registroService.AprobarRegistroDesdeDistritoAsync(request.UsuarioId, gestion.Id);
                return Ok(new { mensaje = "Registro aprobado desde distrito." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpPost("aprobar-todos/{distritoId}")]
        public async Task<IActionResult> AprobarTodos(int distritoId)
        {
            await _registroService.AprobarTodosPendientesDistritoAsync(distritoId);
            return Ok();
        }
        [HttpPost("aprobar-todos-por-grupo/{grupoId}")]
        public async Task<IActionResult> AprobarTodosPorGrupo(int grupoId)
        {
            try
            {
                await _registroService.AprobarTodosPendientesPorGrupoAsync(grupoId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al aprobar todos: {ex.Message}");
            }
        }
        [HttpPost("enviar-a-nacional/{grupoId:int}")]
        [Authorize]
        public async Task<IActionResult> EnviarANacionalPorGrupo([FromRoute] int grupoId)
        {
            var count = await _registroService.EnviarANacionalPorGrupoAsync(grupoId);
            return Ok(new { enviados = count });
        }
        [HttpPost("enviar-a-nacional/individual")]
        [Authorize]
        public async Task<IActionResult> EnviarANacionalIndividual([FromBody] EnviarNacionalDto body)
        {
            if (body == null || body.UsuarioId == Guid.Empty)
                return BadRequest(new { enviado = false, error = "usuarioId inválido" });

            var ok = await _registroService.EnviarANacionalIndividualAsync(body.UsuarioId);
            return ok ? Ok(new { enviado = true }) : BadRequest(new { enviado = false });
        }
        public class EnviarNacionalDto
        {
            public Guid UsuarioId { get; set; }
        }
    }
}
