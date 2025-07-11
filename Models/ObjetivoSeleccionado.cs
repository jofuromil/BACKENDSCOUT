namespace BackendScout.Models
{
    public class ObjetivoSeleccionado
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public Guid ObjetivoEducativoId { get; set; }
        public DateTime FechaSeleccion { get; set; } = DateTime.UtcNow;
        public bool Validado { get; set; } = false;

        public User Usuario { get; set; } = null!;
        public ObjetivoEducativo ObjetivoEducativo { get; set; } = null!;
        public DateTime? FechaValidacion { get; set; } // Nueva
        public Guid? DirigenteValidadorId { get; set; } // Nueva
        public User? DirigenteValidador { get; set; } // Relación opcional
    }
}
