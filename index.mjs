import 'dotenv/config';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { register as listarServicos } from './tools/listar-servicos.mjs';
import { register as listarProfissionais } from './tools/listar-profissionais.mjs';
import { register as verificarDisponibilidade } from './tools/verificar-disponibilidade.mjs';
import { register as criarAgendamento } from './tools/criar-agendamento.mjs';
import { register as listarAgendamentosCliente } from './tools/listar-meus-agendamentos.mjs';
import { register as cancelarAgendamento } from './tools/cancelar-agendamento.mjs';

const API_KEY = process.env.MCP_API_KEY;
if (!API_KEY) {
  console.error('ERRO: defina MCP_API_KEY no ambiente antes de subir o servidor.');
  process.exit(1);
}

function checkAuth(req, res) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || token !== API_KEY) {
    res.status(401).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null });
    return false;
  }
  return true;
}

function createMcpServer() {
  const server = new McpServer({ name: 'mcp_agendamento_fake', version: '1.0.0' });
  listarServicos(server);
  listarProfissionais(server);
  verificarDisponibilidade(server);
  criarAgendamento(server);
  listarAgendamentosCliente(server);
  cancelarAgendamento(server);
  return server;
}

async function handleMcpRequest(req, res) {
  if (!checkAuth(req, res)) return;

  try {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = createMcpServer();
    await server.connect(transport);

    res.on('close', () => {
      transport.close?.().catch(() => {});
      server.close?.().catch(() => {});
    });

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
    }
  }
}

const app = express();
app.use(express.json());
app.post('/mcp', handleMcpRequest);
app.get('/mcp', handleMcpRequest);
app.delete('/mcp', handleMcpRequest);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`[mcp-agendamento-fake] rodando em http://localhost:${PORT}/mcp`);
});
