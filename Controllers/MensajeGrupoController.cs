using BackendScout.Models;
using BackendScout.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MensajeGrupoController : ControllerBase
    {
        private readonly MensajeGrupoService _mensajeService;

        public MensajeGrupoController(MensajeGrupoService mensajeService)
        {
            _mensajeService = mensajeService;
        }

        [HttpPost("enviar")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> EnviarMensaje(
            [FromForm] string Contenido,
            [FromForm] int GrupoScoutId,
            [FromForm] string Destinatarios,
            IFormFile? archivo,
            IFormFile? imagen)
        {
            var remitenteId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (remitenteId == null || GrupoScoutId <= 0)
                return BadRequest("Datos incompletos o token inválido.");

            if (string.IsNullOrWhiteSpace(Contenido) || string.IsNullOrWhiteSpace(Destinatarios))
                return BadRequest("Faltan campos requeridos.");

            var mensaje = new MensajeGrupo
            {
                Id = Guid.NewGuid(),
                Contenido = Contenido,
                GrupoScoutId = GrupoScoutId,
                Destinatarios = Destinatarios.ToUpper(),
                RemitenteId = Guid.Parse(remitenteId),
                FechaEnvio = DateTime.Now
            };

            var carpetaDestino = Path.Combine("ArchivosMensajes", mensaje.GrupoScoutId.ToString());
            Directory.CreateDirectory(carpetaDestino);

            if (archivo != null)
            {
                var nombreArchivo = Guid.NewGuid() + Path.GetExtension(archivo.FileName);
                var rutaCompleta = Path.Combine(carpetaDestino, nombreArchivo);
                using var stream = new FileStream(rutaCompleta, FileMode.Create);
                await archivo.CopyToAsync(stream);

                // Ruta relativa para servir por URL
                mensaje.UrlArchivo = Path.Combine(mensaje.GrupoScoutId.ToString(), nombreArchivo).Replace("\\", "/");
            }

            if (imagen != null)
            {
                var nombreImagen = Guid.NewGuid() + Path.GetExtension(imagen.FileName);
                var rutaCompleta = Path.Combine(carpetaDestino, nombreImagen);
                using var stream = new FileStream(rutaCompleta, FileMode.Create);
                await imagen.CopyToAsync(stream);

                mensaje.UrlImagen = Path.Combine(mensaje.GrupoScoutId.ToString(), nombreImagen).Replace("\\", "/");
            }

            await _mensajeService.EnviarMensajeAsync(mensaje);
            return Ok(mensaje);
        }

        [HttpGet("grupo/{grupoId}")]
        [Authorize(Roles = "Dirigente,Scout")]
        public async Task<IActionResult> ObtenerMensajes(int grupoId)
        {
            var mensajes = await _mensajeService.ObtenerMensajesPorGrupoAsync(grupoId);
            return Ok(mensajes);
        }

        [HttpDelete("{mensajeId}")]
        [Authorize(Roles = "Dirigente")]
        public async Task<IActionResult> EliminarMensaje(Guid mensajeId)
        {
            var remitenteId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (remitenteId == null)
                return Unauthorized();

            var exito = await _mensajeService.EliminarMensajeAsync(mensajeId, Guid.Parse(remitenteId));
            return exito ? Ok() : NotFound();
        }

        [HttpGet("grupo/{grupoId}/mis-mensajes")]
        [Authorize(Roles = "Dirigente,Scout")]
        public async Task<IActionResult> ObtenerMensajesParaUsuario(int grupoId)
        {
            var tipo = User.FindFirstValue(ClaimTypes.Role);
            var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (tipo == "Dirigente")
            {
                // Verificamos si es admin del grupo
                var esAdminGrupo = await _mensajeService.EsAdminDelGrupoAsync(Guid.Parse(usuarioId), grupoId);
                if (esAdminGrupo)
                {
                    // Si es admin, que vea todos los mensajes sin filtro por destinatario
                    var todos = await _mensajeService.ObtenerMensajesPorGrupoAsync(grupoId);
                    return Ok(todos);
                }
            }

            var mensajes = await _mensajeService.ObtenerMensajesParaUsuarioAsync(grupoId, tipo);
            return Ok(mensajes);
        }

        }
    }
