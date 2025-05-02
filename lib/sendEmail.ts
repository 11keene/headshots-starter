// lib/sendEmail.ts

/**
 * Send a “headshots ready” email via Brevo (formerly Sendinblue) using direct HTTP API
 * Avoids SDK issues by calling the REST endpoint via Node fetch
 *
 * @param to Recipient’s email address
 * @param images Array of generated image URLs
 */
export async function sendHeadshotReadyEmail(
    to: string,
    images: string[]
  ) {
    // Build HTML for the email
    const listItems = images
      .map((url) => `<li><a href="${url}" target="_blank">${url}</a></li>`)
      .join("\n");
    const htmlContent = `
      <p>Hi there,</p>
      <p>Your AI Maven Studio headshots are ready! 🎉</p>
      <ul>
        ${listItems}
      </ul>
      <p>If you need any edits, just reply to this email.</p>
    `;
  
    // Call Brevo SMTP transactional email API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.SENDINBLUE_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SENDINBLUE_FROM_NAME!,
          email: process.env.SENDINBLUE_FROM_EMAIL!,
        },
        to: [{ email: to }],
        subject: "Your AI Maven Studio headshots are ready!",
        htmlContent,
      }),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error("🤖 Brevo API error:", response.status, errorText);
      throw new Error(`Email send failed: ${response.status} ${errorText}`);
    }
  }
  