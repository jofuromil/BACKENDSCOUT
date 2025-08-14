namespace BackendScout.Dtos
{
    public class ScoutListaItemDto
    {
        public Guid UserId { get; set; }
        public string NombreCompleto { get; set; } = "";
        public string? CarnetIdentidad { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Sexo { get; set; }
        public string? Colegio { get; set; }
        public string? Curso { get; set; }
    }

    public class UnidadListaDto
    {
        public Guid UnidadId { get; set; }
        public string UnidadNombre { get; set; } = "";
        public string? Rama { get; set; }
        public List<ScoutListaItemDto> Scouts { get; set; } = new();
    }

    public class GrupoListasDto
    {
        public int GrupoScoutId { get; set; }        // int, como en tu modelo
        public string GrupoScoutNombre { get; set; } = "";
        public List<UnidadListaDto> Unidades { get; set; } = new();
    }

    public class DirigenteListaItemDto
    {
        public Guid UserId { get; set; }
        public string NombreCompleto { get; set; } = "";
        public string? CarnetIdentidad { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Sexo { get; set; }
        public string? Profesion { get; set; }
        public string? Ocupacion { get; set; }
        public int GrupoScoutId { get; set; }
        public string GrupoScoutNombre { get; set; } = "";
    }

    public class ListasDistritoDto
    {
        public int DistritoId { get; set; }
        public string DistritoNombre { get; set; } = "";
        public List<GrupoListasDto> Grupos { get; set; } = new();
        public List<DirigenteListaItemDto> Dirigentes { get; set; } = new();
    }
}
