using BackendScout.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistritoUsuarioController : ControllerBase
    {
        private readonly DistritoUsuarioService _service;

        public DistritoUsuarioController(DistritoUsuarioService service)
        {
            _service = service;
        }

        // GET: api/distritousuario/usuarios/{distritoId}
        [HttpGet("usuarios/{distritoId}")]
        public async Task<IActionResult> ObtenerUsuariosPorDistrito(int distritoId)
        {
            var usuarios = await _service.ObtenerUsuariosPorDistrito(distritoId);
            return Ok(usuarios);
        }

        // GET: api/distritousuario/distritos/{usuarioId}
        [HttpGet("distritos/{usuarioId}")]
        public async Task<IActionResult> ObtenerDistritosPorUsuario(Guid usuarioId)
        {
            var distritos = await _service.ObtenerDistritosPorUsuario(usuarioId);
            return Ok(distritos);
        }

        // POST: api/distritousuario/asignar
        [HttpPost("asignar")]
        public async Task<IActionResult> AsignarUsuarioADistrito([FromBody] AsignarUsuarioDistritoRequest request)
        {
            var result = await _service.AsignarUsuarioADistrito(request.UsuarioId, request.DistritoId, request.Rol);
            if (!result)
                return BadRequest("El usuario ya está asignado al distrito.");
            return Ok("Usuario asignado correctamente.");
        }

        // DELETE: api/distritousuario/quitar?usuarioId=...&distritoId=...
        [HttpDelete("quitar")]
        public async Task<IActionResult> QuitarUsuarioDelDistrito([FromQuery] Guid usuarioId, [FromQuery] int distritoId)
        {
            var result = await _service.QuitarUsuarioDelDistrito(usuarioId, distritoId);
            if (!result)
                return NotFound("No se encontró la asignación.");
            return Ok("Usuario eliminado del distrito.");
        }
    }

    public class AsignarUsuarioDistritoRequest
    {
        public Guid UsuarioId { get; set; }
        public int DistritoId { get; set; }
        public string Rol { get; set; }
    }
}
