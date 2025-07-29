using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BackendScout.Services
{
    public class MensajeLimpiezaService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public MensajeLimpiezaService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var mensajeService = scope.ServiceProvider.GetRequiredService<MensajeGrupoService>();

                await mensajeService.EliminarMensajesAntiguosAsync();

                // Ejecutar cada 24 horas
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
