
namespace GastroMatch.Models
{
    public class Jogador
    {
        public int IdJogador { get; set; }

        public string Nome { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        // Relacionamento com as partidas
        public ICollection<Partida> Partidas { get; set; }
    }
}
