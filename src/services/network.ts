export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();
  if (!res.ok) {
    throw new Error(`[HTTP ${res.status}] ${truncateHtml(txt)}`);
  }
  if (!ct.includes('application/json')) {
    throw new Error(`[Bad Content-Type] Expect JSON, got ${ct}. Body head: ${truncateHtml(txt)}`);
  }
  try {
    return JSON.parse(txt) as T;
  } catch {
    throw new Error(`[Invalid JSON] ${truncateHtml(txt)}`);
  }
}

function truncateHtml(html: string, max = 120): string {
  const s = html.replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export async function fakeApi<T>(data: T, delayMs = 200): Promise<T> {
  await new Promise((r) => setTimeout(r, delayMs));
  return data;
}
