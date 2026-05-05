import { z } from 'zod';
import { agendamentos, HORARIOS_DIARIOS, profissionais } from '../store.mjs';

export function register(server) {
  server.registerTool(
    'verificar_disponibilidade',
    {
      description: 'Retorna os horarios livres de um profissional em uma data especifica (formato YYYY-MM-DD).',
      inputSchema: {
        profissional_id: z.number().describe('ID do profissional'),
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data no formato YYYY-MM-DD'),
      },
    },
    async ({ profissional_id, data }) => {
      const prof = profissionais.find(p => p.id === profissional_id);
      if (!prof) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ erro: 'Profissional nao encontrado' }) }],
        };
      }

      const ocupados = new Set(
        agendamentos
          .filter(a => a.profissional_id === profissional_id && a.data === data && a.status === 'confirmado')
          .map(a => a.hora)
      );

      const livres = HORARIOS_DIARIOS.filter(h => !ocupados.has(h));

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ profissional: prof.nome, data, horarios_livres: livres }),
        }],
      };
    }
  );
}
