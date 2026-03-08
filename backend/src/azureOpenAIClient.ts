import { AzureOpenAI } from 'openai';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

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

export async function transcribeAudio(audioUrl: string): Promise<string> {

  const apiKey = process.env.AZURE_OPENAI_API_KEY!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION!;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const whisperDeployment = process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT!;

  const client = new AzureOpenAI({ endpoint, apiKey, deployment: whisperDeployment, apiVersion });

  const tmpPath = path.join('/tmp', `podcast-${Date.now()}.mp3`);
  await downloadFile(audioUrl, tmpPath);

  try {
    const audioStream = fs.createReadStream(tmpPath);
    const transcription = await client.audio.transcriptions.create({
      model: whisperDeployment,
      file: audioStream,
    });
    return transcription.text;
  } finally {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
}

function downloadFile(url: string, destPath: string, redirectsLeft = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }

    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      if ((response.statusCode === 301 || response.statusCode === 302) && response.headers.location) {
        file.close();
        fs.unlink(destPath, () => {});
        if (redirectsLeft <= 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        downloadFile(response.headers.location, destPath, redirectsLeft - 1).then(resolve).catch(reject);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}
