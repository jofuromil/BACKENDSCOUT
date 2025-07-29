namespace BackendScout.Dtos
{
    public class RegistroResumenGrupoDto
    {
        public int GrupoId { get; set; }
        public string NombreGrupo { get; set; }
        public int Enviados { get; set; }
        public int Aprobados { get; set; }
    }
}
