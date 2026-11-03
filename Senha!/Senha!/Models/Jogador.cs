using System.ComponentModel.DataAnnotations;

namespace Senha.Models
{
    public class Jogador
    {
        [Key]
        public int IdJogador { get; set; }

        [Required]
        [StringLength(20)]
        public string Nome { get; set; } = string.Empty;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public ICollection<Partida> Partidas { get; set; }
            = new List<Partida>();
    }
}