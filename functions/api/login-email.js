export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "EAS30 <login@eas30.site>",
                to: [email],
                subject: "Your EAS30 login code",
                html: `
                    <h2>EAS30 Login</h2>
                    <p>Your verification code is:</p>
                    <h1>${code}</h1>
                    <p>If you didn't request this, you can ignore this email.</p>
                `
            })
        });

        const result = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error("Resend error:", result);

            return Response.json(
                { success: false, error: "Could not send email" },
                { status: 500 }
            );
        }

        return Response.json({
            success: true
        });

    } catch (error) {
        console.error("Login email error:", error);

        return Response.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
