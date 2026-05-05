export const servicos = [
  { id: 1, nome: 'Corte de cabelo', duracao_min: 30, preco: 45 },
  { id: 2, nome: 'Coloracao',       duracao_min: 90, preco: 180 },
  { id: 3, nome: 'Manicure',        duracao_min: 45, preco: 35 },
  { id: 4, nome: 'Pedicure',        duracao_min: 45, preco: 40 },
  { id: 5, nome: 'Barba',           duracao_min: 30, preco: 35 },
];

export const profissionais = [
  { id: 10, nome: 'Ana',   servicos: [1, 2] },
  { id: 11, nome: 'Bruno', servicos: [1, 5] },
  { id: 12, nome: 'Carla', servicos: [3, 4] },
];

export const HORARIOS_DIARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export const agendamentos = [
  {
    id: 1, cliente_nome: 'Maria Silva', cliente_telefone: '11999990001',
    servico_id: 1, profissional_id: 10,
    data: '2026-05-12', hora: '10:00', status: 'confirmado',
    criado_em: '2026-05-01T09:00:00Z',
  },
];

let proximoId = 2;
export function gerarId() {
  return proximoId++;
}
