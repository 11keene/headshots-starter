// lib/sendEmail.ts

import SibApiV3Sdk from "sib-api-v3-sdk";

// configure the singleton ApiClient
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.SENDINBLUE_API_KEY!;

// instantiate the transactional email API
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send a “headshots ready” email via Sendinblue/Brevo
 */
export async function sendHeadshotReadyEmail(to: string, images: string[]) {
  const listItems = images
    .map((url) => `<li><a href="${url}" target="_blank">${url}</a></li>`)
    .join("\n");

  const sendSmtpEmail = {
    sender: {
      name: process.env.SENDINBLUE_FROM_NAME!,
      email: process.env.SENDINBLUE_FROM_EMAIL!,
    },
    to: [{ email: to }],
    subject: "Your AI Maven Studio headshots are ready!",
    htmlContent: `
      <p>Hi there,</p>
      <p>Your AI Maven Studio headshots are ready! 🎉</p>
      <ul>${listItems}</ul>
      <p>If you need any edits, just reply to this email.</p>
    `,
  };

  await tranEmailApi.sendTransacEmail(sendSmtpEmail);
}
