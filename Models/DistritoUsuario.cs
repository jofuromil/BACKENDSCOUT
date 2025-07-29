using System;

namespace BackendScout.Models
{
    public class DistritoUsuario
    {
        public int Id { get; set; }

        public Guid UsuarioId { get; set; }
        public User Usuario { get; set; }

        public int NivelDistritoId { get; set; }
        public NivelDistrito NivelDistrito { get; set; }

        public string Rol { get; set; } = "InvitadoDistrito"; // Rol por defecto

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    }
}