using BackendScout.Dtos;
using BackendScout.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendScout.Controllers
{
    [ApiController]
    [Route("api/distrito")]
    public class DistritoController : ControllerBase
    {
        private readonly DistritoResumenService _resumenService;

        public DistritoController(DistritoResumenService resumenService)
        {
            _resumenService = resumenService;
        }

        // Solo AdminDistrito debería poder ver esto (ajusta el policy/role según tu sistema)
        [HttpGet("{distritoId}/resumen-registros")]
        [Authorize] 
        public async Task<ActionResult<ResumenDistritoDto>> GetResumenRegistros([FromRoute] int distritoId)
        {
            var dto = await _resumenService.ObtenerResumenAsync(distritoId);
            return Ok(dto);
        }
    }
}
