export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 204) return null;//no data recvd.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {//anything outside 200 series.
    if (res.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('ct:signedout'));
    throw new ApiError(res.status, data.error || `Request failed (${res.status}).`);
  }
  return data;
}
//401->unauthorized...and if user trying to get in..throw user to signup page.
