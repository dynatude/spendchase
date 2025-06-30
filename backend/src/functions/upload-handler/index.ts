import { APIGatewayProxyEvent } from "aws-lambda";
import { askAzureOpenAI } from "../../azureOpenAIClient";
import * as fs from 'fs';
import * as path from 'path';

export const handler = async (event: APIGatewayProxyEvent, context: any, callback: any) => {

  const filePath = path.join(__dirname, 'system-instructions.txt');
  const systemInstructions = fs.readFileSync(filePath, 'utf-8');

  const result = await askAzureOpenAI(systemInstructions, 'TODO: send binary here');

  return {
    statusCode: 200,
    body: JSON.stringify({ message: result }),
  };
};
