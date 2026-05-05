// Antes: node index.mjs (em outro terminal)
// Depois: node test.mjs
// Le MCP_API_KEY do .env automaticamente.

import 'dotenv/config';

const URL = process.env.MCP_URL || 'http://localhost:3500/mcp';
const TOKEN = process.env.MCP_API_KEY;

if (!TOKEN) {
  console.error('Defina MCP_API_KEY no ambiente.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream',
  'Authorization': `Bearer ${TOKEN}`,
};

async function call(body) {
  const res = await fetch(URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  const m = text.match(/^data:\s*(\{.*\})/m);
  if (m) return JSON.parse(m[1]);
  try { return JSON.parse(text); } catch { return text; }
}

(async () => {
  console.log('--- initialize ---');
  const init = await call({
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } },
  });
  console.log(init?.result?.serverInfo);

  console.log('\n--- tools/list ---');
  const tools = await call({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  (tools?.result?.tools || []).forEach(t => console.log(`  - ${t.name}`));

  console.log('\n--- listar_servicos ---');
  const servs = await call({
    jsonrpc: '2.0', id: 3, method: 'tools/call',
    params: { name: 'listar_servicos', arguments: {} },
  });
  console.log(servs?.result?.content?.[0]?.text);

  console.log('\n--- verificar_disponibilidade (Ana, 2026-05-12) ---');
  const disp = await call({
    jsonrpc: '2.0', id: 4, method: 'tools/call',
    params: { name: 'verificar_disponibilidade', arguments: { profissional_id: 10, data: '2026-05-12' } },
  });
  console.log(disp?.result?.content?.[0]?.text);

  console.log('\n--- criar_agendamento (Joao, corte com Ana, 2026-05-12 14:00) ---');
  const novo = await call({
    jsonrpc: '2.0', id: 5, method: 'tools/call',
    params: {
      name: 'criar_agendamento',
      arguments: {
        cliente_nome: 'Joao Pereira',
        cliente_telefone: '11988887777',
        servico_id: 1, profissional_id: 10,
        data: '2026-05-12', hora: '14:00',
      },
    },
  });
  console.log(novo?.result?.content?.[0]?.text);

  console.log('\n--- listar_agendamentos_cliente (Joao) ---');
  const meus = await call({
    jsonrpc: '2.0', id: 6, method: 'tools/call',
    params: { name: 'listar_agendamentos_cliente', arguments: { cliente_telefone: '11988887777' } },
  });
  console.log(meus?.result?.content?.[0]?.text);
})().catch(e => { console.error(e); process.exit(1); });
