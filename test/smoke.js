// Smoke test: boots the app in-process (demo mode) and exercises the API. Run: npm test
const assert = require('assert'), app = require('../server');
const srv = app.listen(0, async () => {
  const base = `http://localhost:${srv.address().port}/api`;
  const call = async (p, o) => { const r = await fetch(base + p, o); return [r.status, await r.json()]; };
  const send = (p, body, method = 'POST') => call(p, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    let [s, b] = await call('/health'); assert(s === 200 && b.ok, 'health');
    [s, b] = await send('/generate', { name: 'Test', description: 'Demo' }); assert(s === 200 && b.captions.length && b.cta, 'generate');
    [s] = await send('/generate', {}); assert(s === 400, 'validation');
    [s, b] = await send('/items', { inputs: { name: 'T' }, captions: ['a'] }); assert(s === 200, 'save'); const id = b.id;
    [s, b] = await call('/items/' + id); assert(s === 200 && b.captions[0] === 'a', 'read');
    [s] = await call('/items/' + id, { method: 'DELETE' }); assert(s === 200, 'delete');
    [s] = await call('/items/' + id); assert(s === 404, 'gone');
    console.log('smoke tests passed');
  } catch (e) { console.error('FAILED:', e.message); process.exitCode = 1; } finally { srv.close(); }
});
