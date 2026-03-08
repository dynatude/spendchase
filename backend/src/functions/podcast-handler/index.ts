import { APIGatewayProxyEvent } from "aws-lambda";
import { askAzureOpenAI, transcribeAudio } from "../../azureOpenAIClient";
import * as fs from 'fs';
import * as path from 'path';

export const handler = async (event: APIGatewayProxyEvent, context: any, callback: any) => {

  const filePath = path.join(__dirname, 'system-instructions.txt');
  const systemInstructions = fs.readFileSync(filePath, 'utf-8');

  let body: { audioUrl?: string; transcript?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }
  const { audioUrl, transcript: providedTranscript } = body;

  if (!audioUrl && !providedTranscript) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request must include either audioUrl or transcript' }),
    };
  }

  let transcript: string;
  if (providedTranscript) {
    transcript = providedTranscript;
  } else {
    transcript = await transcribeAudio(audioUrl!);
  }

  const result = await askAzureOpenAI(
    systemInstructions,
    `Analyze the following podcast transcript:\n\n${transcript}`
  );

  let analysis: unknown;
  try {
    analysis = JSON.parse(result || '{}');
  } catch {
    analysis = { raw: result };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ transcript, analysis }),
  };
};
