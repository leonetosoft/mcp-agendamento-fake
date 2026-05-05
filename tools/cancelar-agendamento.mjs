import { z } from 'zod';
import { agendamentos } from '../store.mjs';

export function register(server) {
  server.registerTool(
    'cancelar_agendamento',
    {
      description: 'Cancela um agendamento existente. Confirme o telefone do cliente para evitar cancelar de outro.',
      inputSchema: {
        agendamento_id: z.number().describe('ID do agendamento a cancelar'),
        cliente_telefone: z.string().min(8).describe('Telefone do cliente que esta cancelando (deve bater com o do agendamento)'),
      },
    },
    async ({ agendamento_id, cliente_telefone }) => {
      const ag = agendamentos.find(a => a.id === agendamento_id);
      if (!ag) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ sucesso: false, erro: 'Agendamento nao encontrado' }) }],
        };
      }
      if (ag.cliente_telefone !== cliente_telefone) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ sucesso: false, erro: 'Telefone nao confere com o do agendamento' }) }],
        };
      }
      if (ag.status === 'cancelado') {
        return {
          content: [{ type: 'text', text: JSON.stringify({ sucesso: false, erro: 'Agendamento ja estava cancelado' }) }],
        };
      }

      ag.status = 'cancelado';

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ sucesso: true, mensagem: 'Agendamento cancelado. Confirme ao cliente de forma resumida.' }),
        }],
      };
    }
  );
}
