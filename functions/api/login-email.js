export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { email, name } = await request.json();

        if (!email) {
            return Response.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "EAS30 <welcome@eas30.site>",
                to: [email],
                subject: "Welcome to EAS30!",
                html: `
                    <h2>Welcome to EAS30! 🎉</h2>
                    <p>Hi ${name || "there"},</p>
                    <p>Thanks for joining EAS30.</p>
                    <p>You have successfully signed in to your account.</p>
                    <p>We hope you enjoy exploring our gallery, games and community!</p>
                    <br>
                    <p>— EAS30</p>
                `
            })
        });

        const result = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error("Resend error:", result);
            return Response.json(
                { success: false, error: "Email could not be sent" },
                { status: 500 }
            );
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error("Email error:", error);
        return Response.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
