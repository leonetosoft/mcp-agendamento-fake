import { z } from 'zod';
import { agendamentos, gerarId, profissionais, servicos } from '../store.mjs';
import { DIAS_HORIZONTE_AGENDAMENTO, dataExiste, diasEntre, hojeISO } from '../util/datas.mjs';

export function register(server) {
  server.registerTool(
    'criar_agendamento',
    {
      description: 'Cria um novo agendamento. Verifique disponibilidade antes. Pergunte nome e telefone do cliente caso nao saiba.',
      inputSchema: {
        cliente_nome: z.string().min(2).describe('Nome do cliente'),
        cliente_telefone: z.string().min(8).describe('Telefone do cliente (apenas digitos)'),
        servico_id: z.number().describe('ID do servico'),
        profissional_id: z.number().describe('ID do profissional'),
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data YYYY-MM-DD'),
        hora: z.string().regex(/^\d{2}:\d{2}$/).describe('Hora HH:mm'),
      },
    },
    async ({ cliente_nome, cliente_telefone, servico_id, profissional_id, data, hora }) => {
      if (!dataExiste(data)) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `Data ${data} nao existe (mes/dia invalido). Confirme com o cliente a data correta no formato brasileiro DD/MM/AAAA antes de tentar de novo.`,
          }) }],
        };
      }

      const hoje = hojeISO();
      const diff = diasEntre(hoje, data);
      if (diff < 0) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `Data ${data} esta no passado (hoje e ${hoje}). Verifique se voce interpretou corretamente o formato brasileiro DD/MM/AAAA. Confirme a data desejada com o cliente.`,
          }) }],
        };
      }
      if (diff > DIAS_HORIZONTE_AGENDAMENTO) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `Agendamentos so podem ser feitos ate ${DIAS_HORIZONTE_AGENDAMENTO} dias a frente (${diff} dias solicitados). Sugira ao cliente uma data mais proxima.`,
          }) }],
        };
      }

      const servico = servicos.find(s => s.id === servico_id);
      if (!servico) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `Servico ${servico_id} nao encontrado. Chame listar_servicos para obter IDs validos antes de tentar de novo.`,
          }) }],
        };
      }

      const prof = profissionais.find(p => p.id === profissional_id);
      if (!prof) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `Profissional ${profissional_id} nao encontrado. Chame listar_profissionais (pode filtrar por servico_id) para obter IDs validos antes de tentar de novo. NAO invente IDs.`,
          }) }],
        };
      }

      if (!prof.servicos.includes(servico_id)) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            sucesso: false,
            erro: `${prof.nome} nao atende o servico ${servico.nome}. Chame listar_profissionais com servico_id=${servico_id} para ver quem atende.`,
          }) }],
        };
      }

      const conflito = agendamentos.find(a =>
        a.profissional_id === profissional_id &&
        a.data === data && a.hora === hora &&
        a.status === 'confirmado'
      );
      if (conflito) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ sucesso: false, erro: 'Horario ja ocupado' }) }],
        };
      }

      const novo = {
        id: gerarId(),
        cliente_nome,
        cliente_telefone,
        servico_id,
        profissional_id,
        data,
        hora,
        status: 'confirmado',
        criado_em: new Date().toISOString(),
      };
      agendamentos.push(novo);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            sucesso: true,
            agendamento_id: novo.id,
            mensagem: `Agendamento confirmado: ${servico.nome} com ${prof.nome} em ${data} as ${hora}. Confirme ao cliente sem repetir todos os detalhes.`,
          }),
        }],
      };
    }
  );
}
