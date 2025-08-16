using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendScout.Models
{
    public class RolNacionalUsuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Guid UsuarioId { get; set; }

        [ForeignKey(nameof(UsuarioId))]
        public User Usuario { get; set; }

        // Por ahora solo usaremos "AdminNacional"
        [Required]
        public string Rol { get; set; } = "AdminNacional";

        public bool Activo { get; set; } = true;

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    }
}
