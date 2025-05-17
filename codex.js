require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCodex() {
  const response = await openai.createCompletion({
    model: "code-davinci-002", // This is the Codex model
    prompt: "Create a Supabase route in Next.js to save generated prompts to a database.",
    temperature: 0,
    max_tokens: 300,
  });

  console.log("Codex output:\n", response.data.choices[0].text);
}

runCodex();
