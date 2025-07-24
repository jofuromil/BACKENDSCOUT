namespace BackendScout.Dtos.Objetivos
{
    public class ObjetivoUnidadPendienteDto
    {
        public Guid IdSeleccion { get; set; }
        public string? NombreScout { get; set; }
        public string? Rama { get; set; }
        public string? Descripcion { get; set; }
        public string? AreaCrecimiento { get; set; }
        public string? NivelProgresion { get; set; }
        public DateTime? FechaSeleccion { get; set; }
    }
}
