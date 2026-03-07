// Simple smoke test for RootLayout markers
// Requires dev server running at http://localhost:3000

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function testRootLayout() {
  const ready = await waitForServer(BASE);
  if (!ready) throw new Error('Server not responding at ' + BASE);

  const res = await fetch(BASE + '/', { method: 'GET' });
  const html = await res.text();

  const hasHelp = html.includes('aria-label="Help"');
  const hasBrand = html.includes('>DPRIDE<');

  const failures = [];
  if (!hasHelp) failures.push('Missing floating Help button');
  if (!hasBrand) failures.push('Missing Navbar brand text DPRIDE');

  return { status: res.status, hasHelp, hasBrand, failures };
}

(async () => {
  try {
    const root = await testRootLayout();
    console.log('Home status:', root.status);
    console.log('Help button present:', root.hasHelp);
    console.log('Navbar brand present:', root.hasBrand);
    if (root.failures.length) {
      console.error('Failures:', root.failures.join('; '));
      process.exit(1);
    }
    console.log('RootLayout smoke test passed.');
  } catch (e) {
    console.error('Smoke test error:', e.message || e);
    process.exit(1);
  }
})();
