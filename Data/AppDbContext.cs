// AppDbContext.cs
using BackendScout.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendScout.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Unidad> Unidades { get; set; }
        public DbSet<GrupoScout> GruposScout { get; set; }
        public DbSet<GrupoScoutUsuario> GrupoScoutUsuarios { get; set; }
        public DbSet<FichaMedica> FichasMedicas { get; set; }
        public DbSet<ObjetivoEducativo> ObjetivosEducativos { get; set; }
        public DbSet<ObjetivoSeleccionado> ObjetivosSeleccionados { get; set; }
        public DbSet<Mensaje> Mensajes { get; set; }
        public DbSet<Especialidad> Especialidades { get; set; } = null!;
        public DbSet<Requisito> Requisitos { get; set; } = null!;
        public DbSet<RequisitoCumplido> RequisitoCumplidos { get; set; } = null!;
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<UsuarioEvento> UsuarioEvento { get; set; }
        public DbSet<EventoOrganizador> OrganizadoresEvento { get; set; }
        public DbSet<DocumentoEvento> DocumentosEvento { get; set; }
        public DbSet<MensajeEvento> MensajesEvento { get; set; }
        public DbSet<MensajeEventoDestinatario> MensajesEventoDestinatarios { get; set; }
        public DbSet<PasswordResetCode> PasswordResetCodes { get; set; }
        public DbSet<MensajeGrupo> MensajesGrupo { get; set; }
        public DbSet<Gestion> Gestiones { get; set; }
        public DbSet<RegistroGestion> RegistrosGestion { get; set; }

        // ✅ DbSet corregido
        public DbSet<NivelDistrito> NivelesDistrito { get; set; }
        public DbSet<DistritoUsuario> DistritoUsuarios { get; set; }
        public DbSet<RolNacionalUsuario> RolesNacionales { get; set; }


        public void LimpiarRequisitosInvalidos()
        {
            var idsUsuarios = Users.Select(u => u.Id).ToHashSet();
            var registrosInvalidos = RequisitoCumplidos.Where(rc => !idsUsuarios.Contains(rc.ScoutId));
            RequisitoCumplidos.RemoveRange(registrosInvalidos);
            SaveChanges();
        }

        public async Task EliminarRequisitosCumplidosInvalidos()
        {
            var requisitosInvalidos = RequisitoCumplidos
                .Where(rc => !Users.Any(u => u.Id == rc.ScoutId) || !Requisitos.Any(r => r.Id == rc.RequisitoId));

            RequisitoCumplidos.RemoveRange(requisitosInvalidos);
            await SaveChangesAsync();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UsuarioEvento>()
                .HasOne(ue => ue.User)
                .WithMany()
                .HasForeignKey(ue => ue.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UsuarioEvento>()
                .HasOne(ue => ue.Evento)
                .WithMany()
                .HasForeignKey(ue => ue.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Evento>()
                .HasOne(e => e.OrganizadorUnidad)
                .WithMany(u => u.EventosOrganizados)
                .HasForeignKey(e => e.OrganizadorUnidadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PasswordResetCode>()
                .HasOne(p => p.Usuario)
                .WithMany()
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Relación NivelDistrito ↔ Unidad
            modelBuilder.Entity<Unidad>()
                .HasOne(u => u.NivelDistrito)
                .WithMany(d => d.Unidades)
                .HasForeignKey(u => u.NivelDistritoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación DirigenteValidador ↔ ObjetivoSeleccionado
            modelBuilder.Entity<ObjetivoSeleccionado>()
                .HasOne(o => o.DirigenteValidador)
                .WithMany()
                .HasForeignKey(o => o.DirigenteValidadorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación DirigenteValidador ↔ RequisitoCumplido
            modelBuilder.Entity<RequisitoCumplido>()
                .HasOne(r => r.DirigenteValidador)
                .WithMany()
                .HasForeignKey(r => r.DirigenteValidadorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación DistritoUsuario ↔ Usuario y NivelDistrito
            modelBuilder.Entity<DistritoUsuario>()
                .HasOne(du => du.Usuario)
                .WithMany(u => u.DistritoUsuarios)
                .HasForeignKey(du => du.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DistritoUsuario>()
                .HasOne(du => du.NivelDistrito)
                .WithMany()
                .HasForeignKey(du => du.NivelDistritoId)
                .OnDelete(DeleteBehavior.Cascade);
    

        }
    }
}
