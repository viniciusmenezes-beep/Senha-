
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Senha.Data;
using Senha.Models;

namespace Senha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class JogadorController : ControllerBase
    {
        private readonly SenhaContext _context;

        public JogadorController(SenhaContext context)
        {
            _context = context;
        }

        // CADASTRAR JOGADOR
        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromBody] Jogador jogador)
        {
            if (jogador == null)
            {
                return BadRequest("Nenhum dado de jogador foi recebido.");
            }

            if (string.IsNullOrWhiteSpace(jogador.Nome))
            {
                return BadRequest("Informe o nome do jogador.");
            }

            jogador.Nome = jogador.Nome.Trim();

            _context.Jogadores.Add(jogador);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Jogador cadastrado com sucesso!",
                idJogador = jogador.IdJogador,
                nome = jogador.Nome
            });
        }

        // BUSCAR JOGADOR PELO ID
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var jogador = await _context.Jogadores
                .FirstOrDefaultAsync(j => j.IdJogador == id);

            if (jogador == null)
            {
                return NotFound("Jogador não encontrado.");
            }

            return Ok(jogador);
        }

        // LISTAR TODOS OS JOGADORES
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var jogadores = await _context.Jogadores
                .OrderBy(j => j.Nome)
                .ToListAsync();

            return Ok(jogadores);
        }

        // REGISTRAR UMA PARTIDA
        [HttpPost("{idJogador}/partidas")]
        public async Task<IActionResult> RegistrarPartida(
            int idJogador,
            [FromBody] Partida partida)
        {
            var jogador = await _context.Jogadores
                .FindAsync(idJogador);

            if (jogador == null)
            {
                return NotFound("Jogador não encontrado.");
            }

            if (partida.TempoSegundos < 0 ||
                partida.Tentativas < 1 ||
                partida.Tentativas > 6)
            {
                return BadRequest("Dados da partida inválidos.");
            }

            partida.IdJogador = idJogador;
            partida.DataPartida = DateTime.Now;

            _context.Partidas.Add(partida);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Partida registrada com sucesso!",
                idPartida = partida.IdPartida
            });
        }

        // HISTÓRICO DE PARTIDAS DE UM JOGADOR
        [HttpGet("{idJogador}/partidas")]
        public async Task<IActionResult> Historico(int idJogador)
        {
            var jogador = await _context.Jogadores
                .FindAsync(idJogador);

            if (jogador == null)
            {
                return NotFound("Jogador não encontrado.");
            }

            var partidas = await _context.Partidas
                .Where(p => p.IdJogador == idJogador)
                .OrderByDescending(p => p.DataPartida)
                .ToListAsync();

            return Ok(partidas);
        }

        // RANKING GERAL
        [HttpGet("ranking")]
        public async Task<IActionResult> Ranking()
        {
            var ranking = await _context.Jogadores
                .Select(j => new
                {
                    j.IdJogador,
                    j.Nome,
                    TotalPartidas = j.Partidas.Count(),
                    Vitorias = j.Partidas.Count(p => p.Venceu),
                    Derrotas = j.Partidas.Count(p => !p.Venceu),

                    MelhorPartida = j.Partidas
                        .OrderBy(p => p.TempoSegundos)
                        .ThenBy(p => p.Tentativas)
                        .Select(p => new
                        {
                            p.TempoSegundos,
                            p.Tentativas,
                            p.Venceu
                        })
                        .FirstOrDefault()
                })
                .Where(j => j.TotalPartidas > 0)
                .OrderBy(j => j.MelhorPartida!.TempoSegundos)
                .ThenBy(j => j.MelhorPartida!.Tentativas)
                .ToListAsync();

            return Ok(ranking);
        }
    }
}
