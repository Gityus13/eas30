// POST /api/login-email
// Sends the welcome email to the address on the caller's verified session.
// Nothing is read from the request body, so this can't be used to email other people.

import { escapeHtml, getSessionUser, json } from "../_lib/session.js";

const PROVIDER_LABELS = {
    google: "Google",
    discord: "Discord",
    github: "GitHub",
    microsoft: "Microsoft",
    telegram: "Telegram",
};

export async function onRequestPost({ request, env }) {
    const user = await getSessionUser(request, env);
    if (!user) {
        return json({ success: false, error: "Not signed in" }, 401);
    }

    // Some accounts (e.g. Telegram) have no email, so there's nothing to send.
    if (!user.email) {
        return json({ success: true, skipped: true });
    }

    if (!env.RESEND_API_KEY) {
        return json({ success: false, error: "Email is not configured" }, 500);
    }

    const name = escapeHtml(user.name || "there");
    const via = PROVIDER_LABELS[user.provider]
        ? ` with ${PROVIDER_LABELS[user.provider]}`
        : "";

    try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "EAS30 <welcome@eas30.site>",
                to: [user.email],
                subject: "Welcome to EAS30!",
                html: `
                    <h2>Welcome to EAS30! 🎉</h2>
                    <p>Hi ${name},</p>
                    <p>Thanks for joining EAS30.</p>
                    <p>You have successfully signed in${via}.</p>
                    <p>We hope you enjoy exploring our gallery, games and community!</p>
                    <br>
                    <p>— EAS30</p>
                `,
            }),
        });

        if (!resendResponse.ok) {
            console.error("Resend error:", await resendResponse.text());
            return json({ success: false, error: "Email could not be sent" }, 500);
        }

        return json({ success: true });
    } catch (error) {
        console.error("Email error:", error);
        return json({ success: false, error: "Server error" }, 500);
    }
}
