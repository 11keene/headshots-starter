import SibApiV3Sdk from "@sendinblue/client";

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
tranEmailApi.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY!);

/**
 * Send a “headshots ready” email via Sendinblue
 */
export async function sendHeadshotReadyEmail(
  to: string,
  images: string[]
) {
  // Build a simple HTML list of links
  const htmlLinks = images
    .map((url) => `<li><a href="${url}" target="_blank">${url}</a></li>`)
    .join("");

  const email = {
    sender: {
      name: process.env.SENDINBLUE_FROM_NAME,
      email: process.env.SENDINBLUE_FROM_EMAIL,
    },
    to: [{ email: to }],
    subject: "Your AI Maven Studio headshots are ready!",
    htmlContent: `
      <p>Hi there,</p>
      <p>Your AI Maven Studio headshots are ready! 🎉</p>
      <p>Click to view or download:</p>
      <ul>${htmlLinks}</ul>
      <p>If you’d like any tweaks, just reply to this email.</p>
    `,
  };

  await tranEmailApi.sendTransacEmail(email);
}
