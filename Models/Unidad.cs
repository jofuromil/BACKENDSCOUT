using System;
using System.Collections.Generic;

namespace BackendScout.Models
{
    public class Unidad
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = string.Empty;
        public string Rama { get; set; } = string.Empty;

        // Relación con Grupo Scout
        public string GrupoScoutNombre { get; set; } = string.Empty;
        public int GrupoScoutId { get; set; }
        public GrupoScout GrupoScout { get; set; }

        // 🔁 Eliminado: public string Distrito
        // ✅ Relación con NivelDistrito
        public int NivelDistritoId { get; set; }
        public NivelDistrito NivelDistrito { get; set; }

        public string CodigoUnidad { get; set; } = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        public Guid DirigenteId { get; set; }

        public ICollection<Evento> EventosOrganizados { get; set; }
        // ⬆️ Agregamos esta relación para que GrupoScoutService pueda contar usuarios
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}


