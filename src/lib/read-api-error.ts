/** Format error text from a response body you already read as `raw` (avoids double-reading Response). */
export function formatApiErrorBody(
  status: number,
  statusText: string,
  raw: string
): string {
  const statusLine = `HTTP ${status}${statusText ? ` ${statusText}` : ''}`;
  if (!raw.trim()) {
    return `Anfrage fehlgeschlagen (${statusLine}). Leere Antwort vom Server.`;
  }
  try {
    const json = JSON.parse(raw) as {
      error?: string;
      detail?: string;
      message?: string;
    };
    const parts = [json.error, json.detail, json.message].filter(
      (s): s is string => typeof s === 'string' && s.length > 0
    );
    if (parts.length > 0) {
      return `${parts.join(' — ')} (${statusLine})`;
    }
  } catch {
    // not JSON (e.g. HTML error page)
  }
  const snippet = raw.replace(/\s+/g, ' ').trim().slice(0, 280);
  return snippet
    ? `${snippet} (${statusLine})`
    : `Anfrage fehlgeschlagen (${statusLine}).`;
}

/** Parse failed fetch Response into a short message for toasts (JSON or HTML snippet + status). */
export async function readApiErrorResponse(res: Response): Promise<string> {
  const raw = await res.text();
  return formatApiErrorBody(res.status, res.statusText, raw);
}
