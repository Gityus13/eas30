export async function onRequestGet(context) {
    return new Response(
        JSON.stringify({ success: true }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
