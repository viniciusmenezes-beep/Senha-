
namespace GastroMatch.Models
{
    public class Partida
    {
        public int IdPartida { get; set; }

        public int IdJogador { get; set; }

        public int TempoSegundos { get; set; }

        public int Tentativas { get; set; }

        public bool Venceu { get; set; }

        public DateTime DataPartida { get; set; } = DateTime.Now;

        // Relacionamento com Jogador
        public Jogador Jogador { get; set; }
    }
}
