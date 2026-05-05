import { z } from 'zod';
import { servicos } from '../store.mjs';

export function register(server) {
  server.registerTool(
    'listar_servicos',
    {
      description: 'Lista os servicos disponiveis para agendamento (corte, manicure, etc) com preco e duracao.',
      inputSchema: {
        busca: z.string().optional().describe('Filtro por nome do servico'),
      },
    },
    async ({ busca }) => {
      const filtrados = busca
        ? servicos.filter(s => s.nome.toLowerCase().includes(busca.toLowerCase()))
        : servicos;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ dados: filtrados, total: filtrados.length }),
        }],
      };
    }
  );
}
