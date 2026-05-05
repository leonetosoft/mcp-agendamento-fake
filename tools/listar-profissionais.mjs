import { z } from 'zod';
import { profissionais } from '../store.mjs';

export function register(server) {
  server.registerTool(
    'listar_profissionais',
    {
      description: 'Lista profissionais disponiveis. Pode filtrar pelos que atendem um servico especifico.',
      inputSchema: {
        servico_id: z.number().optional().describe('Filtra apenas profissionais que atendem este servico'),
      },
    },
    async ({ servico_id }) => {
      const filtrados = servico_id
        ? profissionais.filter(p => p.servicos.includes(servico_id))
        : profissionais;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ dados: filtrados, total: filtrados.length }),
        }],
      };
    }
  );
}
