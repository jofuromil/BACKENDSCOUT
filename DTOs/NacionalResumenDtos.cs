namespace BackendScout.Dtos
{
    public class NacionalResumenRamasDto
    {
        public int Lobatos { get; set; }
        public int Exploradores { get; set; }
        public int Pioneros { get; set; }
        public int Rovers { get; set; }
        public int Dirigentes { get; set; }
    }

    public class NacionalResumenDistritoDto
    {
        public int? DistritoId { get; set; }
        public string? DistritoNombre { get; set; }
        public int Enviados { get; set; }
        public int Pendientes { get; set; }
        public int Aprobados { get; set; }
    }

    public class NacionalResumenDto
    {
        public int TotalEnviados { get; set; }
        public int TotalPendientes { get; set; }
        public int TotalAprobados { get; set; }

        // Por rama (pendientes y aprobados)
        public NacionalResumenRamasDto PendientesPorRama { get; set; } = new();
        public NacionalResumenRamasDto AprobadosPorRama { get; set; } = new();

        // Por distrito
        public List<NacionalResumenDistritoDto> PorDistrito { get; set; } = new();
    }
}
