using Microsoft.EntityFrameworkCore;
using Senha.Models;

namespace Senha.Data
{
    public class SenhaContext : DbContext
    {
        public SenhaContext(DbContextOptions<SenhaContext> options)
            : base(options)
        {
        }

        public DbSet<Jogador> Jogadores { get; set; }

        public DbSet<Partida> Partidas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Jogador>()
                .HasKey(j => j.IdJogador);

            modelBuilder.Entity<Partida>()
                .HasKey(p => p.IdPartida);

            modelBuilder.Entity<Jogador>()
                .HasMany(j => j.Partidas)
                .WithOne(p => p.Jogador)
                .HasForeignKey(p => p.IdJogador);
        }
    }
}