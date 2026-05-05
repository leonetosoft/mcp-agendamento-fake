const TIMEZONE = process.env.MCP_TIMEZONE || 'America/Sao_Paulo';
export const DIAS_HORIZONTE_AGENDAMENTO = 60;

export function hojeISO() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const obj = Object.fromEntries(partes.map(p => [p.type, p.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

export function dataExiste(yyyy_mm_dd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyy_mm_dd);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function diasEntre(dataA, dataB) {
  const [ay, am, ad] = dataA.split('-').map(Number);
  const [by, bm, bd] = dataB.split('-').map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86400000);
}
