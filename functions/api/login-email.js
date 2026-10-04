export async function onRequestPost(context) {
    return new Response(
        JSON.stringify({ success: true }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}