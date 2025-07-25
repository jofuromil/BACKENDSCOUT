using BackendScout.Models;
using BackendScout.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

    }
}
