namespace BackendScout.DTOs
{
    public class ActualizarPerfilRequest
    {
        public string? CI { get; set; }                  // Solo números
        public string? ComplementoCI { get; set; }       // Letras o símbolos como guión

        public string NombreCompleto { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Telefono { get; set; }
        public string Ciudad { get; set; }

        public string? Direccion { get; set; }
        public string? InstitucionEducativa { get; set; }
        public string? NivelEstudios { get; set; }
        public string? Genero { get; set; }
        public string? Profesion { get; set; }   // SOLO dirigentes
        public string? Ocupacion { get; set; }   // SOLO dirigentes
    }
}
