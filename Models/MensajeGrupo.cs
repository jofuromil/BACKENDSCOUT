using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendScout.Models
{
    public class MensajeGrupo
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public int GrupoScoutId { get; set; }

        [ForeignKey("GrupoScoutId")]
        public GrupoScout GrupoScout { get; set; }

        public Guid RemitenteId { get; set; }

        [ForeignKey("RemitenteId")]
        public User Remitente { get; set; }

        [Required]
        public string Contenido { get; set; }

        public string? UrlArchivo { get; set; }

        public string? UrlImagen { get; set; }

        [Required]
        public string Destinatarios { get; set; } // "SCOUTS", "DIRIGENTES", "TODOS"

        public DateTime FechaEnvio { get; set; } = DateTime.Now;
    }
}
