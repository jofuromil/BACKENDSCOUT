namespace BackendScout.Dtos.Grupo
{
    public class ResumenUnidadGrupoDto
    {
        public Guid UnidadId { get; set; }
        public string Nombre { get; set; }
        public string Rama { get; set; }

        public int CantDirigentes { get; set; }
        public int CantDirigentesHombres { get; set; }
        public int CantDirigentesMujeres { get; set; }

        public int CantScouts { get; set; }
        public int CantScoutsHombres { get; set; }
        public int CantScoutsMujeres { get; set; }

        public int Total { get; set; }
    }
}
