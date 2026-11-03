using System.ComponentModel.DataAnnotations;

namespace Senha.Models
{
    public class Partida
    {
        [Key]
        public int IdPartida { get; set; }

        public int IdJogador { get; set; }

        public int TempoSegundos { get; set; }

        public int Tentativas { get; set; }

        public bool Venceu { get; set; }

        public DateTime DataPartida { get; set; } = DateTime.Now;

        
        // Jogador pode ser nulo durante o recebimento da requisição
        public Jogador? Jogador { get; set; }
    }
}