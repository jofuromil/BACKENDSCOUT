using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendScout.Models
{
    public class RegistroGestion
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public User Usuario { get; set; }

        [Required]
        public Guid GestionId { get; set; }

        [ForeignKey("GestionId")]
        public Gestion Gestion { get; set; }

        // Estado de registro
        public bool AprobadoGrupo { get; set; } = false;
        public DateTime? FechaAprobadoGrupo { get; set; }
        public bool EnviadoADistrito { get; set; } = false;
        public DateTime? FechaEnvioDistrito { get; set; }

        public bool AprobadoDistrito { get; set; } = false;
        public DateTime? FechaAprobadoDistrito { get; set; }

        public bool EnviadoANacional { get; set; } = false;
        public bool AprobadoNacional { get; set; } = false;
        public DateTime? FechaAprobadoNacional { get; set; }

        // Datos estáticos del usuario al ser aprobado a nivel nacional
        public string? NombreCompleto { get; set; }
        public string? CI { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Rama { get; set; }
        public string? UnidadNombre { get; set; }
        public string? GrupoNombre { get; set; }
        public string? DistritoNombre { get; set; }
        public Guid UnidadId { get; set; }

        [ForeignKey("UnidadId")]
        public Unidad Unidad { get; set; }
        public int? GrupoScoutId { get; set; }

    }
}
