import { AzureOpenAI } from 'openai';

export async function askAzureOpenAI(systemInstructions: string, prompt: string) {

  const apiKey = process.env.AZURE_OPENAI_API_KEY!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION!;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const modelName = process.env.AZURE_OPENAI_MODEL_NAME!;

  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: systemInstructions },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 800,
    temperature: 0.01,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: modelName
  });

  //if (response?.error !== undefined && response.status !== "200") {
  //  throw response.error;
  //}

  return response.choices[0].message.content;
}
