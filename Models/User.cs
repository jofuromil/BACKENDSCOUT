namespace BackendScout.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // CI separado en dos campos
        public string? CI { get; set; }                  // Solo números
        public string? ComplementoCI { get; set; }       // Puede ser guion, letra u otros

        public string NombreCompleto { get; set; }
        public DateTime FechaNacimiento { get; set; }

        public string Telefono { get; set; }             // Validar que sea solo números
        public string Correo { get; set; }
        public string Password { get; set; } = string.Empty;
        public string Ciudad { get; set; }

        public string Tipo { get; set; }                 // "Scout" o "Dirigente"
        public string Rama { get; set; }                 // Lobatos, Exploradores, etc.

        public Guid? UnidadId { get; set; }
        public Unidad? Unidad { get; set; }

        // Nuevos campos de ficha personal
        public string? Direccion { get; set; }
        public string? InstitucionEducativa { get; set; }
        public string? NivelEstudios { get; set; }

        // Validar en frontend que solo acepte "Femenino" o "Masculino"
        public string? Genero { get; set; }

        // Solo para dirigentes
        public string? Profesion { get; set; }
        public string? Ocupacion { get; set; }

        // Admin grupo scout
        public bool EsAdminGrupoScout { get; set; } = false;
        public List<GrupoScoutUsuario>? GrupoScoutUsuarios { get; set; }

        // Relación con distritos
        public List<NivelDistritoUsuario>? NivelDistritoUsuarios { get; set; }
    }
}
