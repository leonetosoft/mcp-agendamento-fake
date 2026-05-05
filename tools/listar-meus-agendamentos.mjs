import { z } from 'zod';
import { agendamentos, profissionais, servicos } from '../store.mjs';

export function register(server) {
  server.registerTool(
    'listar_agendamentos_cliente',
    {
      description: 'Lista agendamentos de um cliente pelo telefone.',
      inputSchema: {
        cliente_telefone: z.string().min(8).describe('Telefone do cliente (apenas digitos)'),
      },
    },
    async ({ cliente_telefone }) => {
      const lista = agendamentos
        .filter(a => a.cliente_telefone === cliente_telefone)
        .map(a => {
          const s = servicos.find(x => x.id === a.servico_id);
          const p = profissionais.find(x => x.id === a.profissional_id);
          return {
            id: a.id,
            servico: s?.nome ?? '?',
            profissional: p?.nome ?? '?',
            data: a.data,
            hora: a.hora,
            status: a.status,
          };
        });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ dados: lista, total: lista.length }),
        }],
      };
    }
  );
}
