// CORS for the static GitHub Pages frontend talking to the auth API.
const ALLOWED_ORIGINS = new Set([
    "https://eas30.site",
    "https://www.eas30.site",
]);

export async function onRequest(context) {\n    const { request } = context;
    const origin = request.headers.get("Origin");
    const allowed = origin && ALLOWED_ORIGINS.has(origin);
    const headers = new Headers();
    if (allowed) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
        headers.append("Vary", "Origin");
    }
    if (request.method === "OPTIONS") {
        return new Response(null, { status: allowed ? 204 : 403, headers });
    }
    const response = await context.next();
    if (!allowed) return response;
    const merged = new Headers(response.headers);
    for (const [key, value] of headers) {
        if (key.toLowerCase() === "vary" && merged.has("Vary")) {
            merged.set("Vary", merged.get("Vary") + ", Origin");
        } else {
            merged.set(key, value);
        }
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: merged });
}
