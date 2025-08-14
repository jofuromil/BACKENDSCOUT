namespace BackendScout.Dtos
{
    public class SexoCountDto
    {
        public int M { get; set; }
        public int F { get; set; }
        public int T => M + F;
    }

    public class RamaCountDto
    {
        public SexoCountDto LOB { get; set; } = new();
        public SexoCountDto EXP { get; set; } = new();
        public SexoCountDto PIO { get; set; } = new();
        public SexoCountDto ROV { get; set; } = new();
        public SexoCountDto DIR { get; set; } = new();
        public int TotalM => LOB.M + EXP.M + PIO.M + ROV.M + DIR.M;
        public int TotalF => LOB.F + EXP.F + PIO.F + ROV.F + DIR.F;
        public int Total  => TotalM + TotalF;
    }

    public class UnidadRamaCountDto
    {
        public Guid UnidadId { get; set; }           // Unidad = Guid (correcto)
        public string UnidadNombre { get; set; }
        public RamaCountDto Conteo { get; set; } = new();
    }

    public class GrupoResumenDto
    {
        public int GrupoScoutId { get; set; }        // <-- CAMBIAR A int
        public string GrupoScoutNombre { get; set; }
        public int NumeroUnidades { get; set; }
        public RamaCountDto TotalesGrupo { get; set; } = new();
        public List<UnidadRamaCountDto> Unidades { get; set; } = new();
    }

    public class ResumenDistritoDto
    {
        public int DistritoId { get; set; }
        public string DistritoNombre { get; set; }
        public List<GrupoResumenDto> Grupos { get; set; } = new();
        public RamaCountDto TotalesDistrito { get; set; } = new();
    }
}
